import { performSubdivision } from './js/performSubdivision.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Materials
const solidMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff });
const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });

let mesh = null;
let wireframe = null;
let displacementTexture = null;

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 5, 5);
scene.add(directionalLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight1.position.set(-5, 5, 5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(5, -5, 5);
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight3.position.set(5, 5, -5);
scene.add(directionalLight3);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(0, 0, 20);
scene.add(pointLight);

// GUI Parameters
const scaleFactors = {
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
};

const displacementSettings = {
    displacementScale: 0.1,
    invertDisplacement: false,
    flipUV: false  // New setting
};

const rotation = {
    rotateX: -90, // Default to -90 to match initial orientation
    rotateY: 0,
    rotateZ: 0
};

const subdivisionSettings = {
    iterations: 1,
    split: false,
    preserveEdges: true,
    flatOnly: false,
    subdivide: function() {
        const result = performSubdivision({
            mesh,
            wireframe,
            scene,
            solidMaterial,
            wireframeMaterial,
            subdivisionSettings: this,
            displacementTexture,
            updateDimensions,
            applyDisplacement
        });
        
        if (result) {
            mesh = result.mesh;
            wireframe = result.wireframe;
        }
    }
};

// GUI Setup
const gui = new dat.GUI();

const scaleFolder = gui.addFolder('Scale');
scaleFolder.add(scaleFactors, 'scaleX', 0.1, 10).step(0.01).onChange(applyScaling);
scaleFolder.add(scaleFactors, 'scaleY', 0.1, 10).step(0.01).onChange(applyScaling);
scaleFolder.add(scaleFactors, 'scaleZ', 0.1, 10).step(0.01).onChange(applyScaling);

const displacementFolder = gui.addFolder('Displacement');
displacementFolder.add(displacementSettings, 'displacementScale', 0, 1, 0.01).onChange(applyDisplacement);
displacementFolder.add(displacementSettings, 'invertDisplacement').onChange(applyDisplacement);
displacementFolder.add(displacementSettings, 'flipUV').name('Flip UV').onChange(reapplyDisplacement);

const rotationFolder = gui.addFolder('Rotation');
rotationFolder.add(rotation, 'rotateX', -180, 180, 30).onChange(() => setRotation(mesh, wireframe));
rotationFolder.add(rotation, 'rotateY', -180, 180, 30).onChange(() => setRotation(mesh, wireframe));
rotationFolder.add(rotation, 'rotateZ', -180, 180, 30).onChange(() => setRotation(mesh, wireframe));

const subdivisionFolder = gui.addFolder('Subdivision');
subdivisionFolder.add(subdivisionSettings, 'iterations', 1, 6, 1);
subdivisionFolder.add(subdivisionSettings, 'split').name('Split Faces');
subdivisionFolder.add(subdivisionSettings, 'preserveEdges').name('Preserve Edges');
subdivisionFolder.add(subdivisionSettings, 'flatOnly').name('Flat Subdivision');
subdivisionFolder.add(subdivisionSettings, 'subdivide').name('Apply Subdivision');

// GUI Buttons
addGUIMenuButton(gui, 'Toggle Wireframe', toggleWireframe);
addGUIMenuButton(gui, 'Upload STL', () => document.getElementById('stlFile').click());
addGUIMenuButton(gui, 'Upload Image', () => document.getElementById('imageFile').click());
addGUIMenuButton(gui, 'Download STL', downloadSTL);
addGUIMenuButton(gui, 'Center Camera', centerCamera);

// Open folders by default
scaleFolder.open();
displacementFolder.open();
rotationFolder.open();
subdivisionFolder.open();

// Event Listeners
document.getElementById('stlFile').addEventListener('change', handleSTLUpload);
document.getElementById('imageFile').addEventListener('change', handleImageUpload);

function reapplyDisplacement() {
    if (mesh && displacementTexture) {
        applyDisplacement();
    }
}

function addGUIMenuButton(gui, name, onClickCallback) {
    const obj = { [name]: onClickCallback };
    gui.add(obj, name);
}

function centerCamera() {
    if (!mesh) return;
    
    // Get the bounding box of the mesh
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // Calculate the distance based on the size of the object
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.5;
    
    // Set camera position and target
    // Position camera slightly elevated to better show the vertical orientation
    camera.position.set(cameraDistance * 0.5, cameraDistance * 0.5, cameraDistance);
    controls.target.copy(center);
    
    // Update controls and camera
    controls.update();
    camera.updateProjectionMatrix();
}

function handleSTLUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(e.target.result);

            if (mesh) {
                scene.remove(mesh);
                scene.remove(wireframe);
            }

            geometry.computeVertexNormals();
            
            // Store original positions
            geometry.originalPositions = geometry.attributes.position.array.slice();

            mesh = new THREE.Mesh(geometry, solidMaterial);
            wireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
            wireframe.visible = false;

            // Rotate mesh to make Z vertical
            mesh.rotation.x = -Math.PI / 2;
            wireframe.rotation.x = -Math.PI / 2;

            scene.add(mesh);
            scene.add(wireframe);

            // Reset rotation values in the GUI
            rotation.rotateX = -90;
            rotation.rotateY = 0;
            rotation.rotateZ = 0;

            // Update GUI controllers
            for (let i in rotationFolder.__controllers) {
                rotationFolder.__controllers[i].updateDisplay();
            }

            applyScaling();
            applyDisplacement();
            updateDimensions();
            centerCamera();
        };
        reader.readAsArrayBuffer(file);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            displacementTexture = texture;
            applyDisplacement();
        });
    }
}

function toggleWireframe() {
    if (wireframe) {
        wireframe.visible = !wireframe.visible;
    }
}

function applyDisplacement() {
    if (displacementTexture && mesh) {
        const scale = displacementSettings.displacementScale * 
            (displacementSettings.invertDisplacement ? -1 : 1);
        resetGeometry(mesh.geometry);
        resetGeometry(wireframe.geometry);
        applyDisplacementMap(mesh.geometry, displacementTexture, scale);
        applyDisplacementMap(wireframe.geometry, displacementTexture, scale);
    }
}

function resetGeometry(geometry) {
    if (geometry.originalPositions) {
        const position = geometry.attributes.position;
        position.array.set(geometry.originalPositions);
        position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}

function applyDisplacementMap(geometry, texture, scale) {
    if (!texture || !geometry) return geometry;
    
    geometry.computeVertexNormals();

    const position = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const uv = generateUVs(geometry);
    const dispMap = texture.image;

    if (!dispMap) return geometry;

    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = dispMap.width;
    canvas.height = dispMap.height;
    const context = canvas.getContext('2d');
    context.drawImage(dispMap, 0, 0);
    const imageData = context.getImageData(0, 0, dispMap.width, dispMap.height);
    const data = imageData.data;

    // Create a map to store vertex data using a more precise key
    const vertexMap = new Map();
    const positionArray = position.array;
    
    // First pass: gather all unique vertices and their displacements
    for (let i = 0; i < position.count; i++) {
        const x = positionArray[i * 3];
        const y = positionArray[i * 3 + 1];
        const z = positionArray[i * 3 + 2];
        
        // Create a unique key for this vertex position
        const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
        
        // Get UV coordinates and calculate displacement
        const ux = Math.floor(uv.getX(i) * dispMap.width);
        const uy = Math.floor(uv.getY(i) * dispMap.height);
        const pixelIndex = (uy * dispMap.width + ux) * 4;
        const displacement = (data[pixelIndex] / 255) * scale;
        
        if (!vertexMap.has(key)) {
            vertexMap.set(key, {
                indices: [i],
                displacement: displacement,
                normal: new THREE.Vector3(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                )
            });
        } else {
            const entry = vertexMap.get(key);
            entry.indices.push(i);
            entry.displacement = (entry.displacement * entry.indices.length + displacement) / (entry.indices.length + 1);
            entry.normal.add(new THREE.Vector3(
                normals.getX(i),
                normals.getY(i),
                normals.getZ(i)
            ));
        }
    }

    // Second pass: apply averaged displacements to all vertices
    vertexMap.forEach(vertexData => {
        // Normalize the accumulated normal vector
        vertexData.normal.normalize();
        
        // Apply the same displacement to all instances of this vertex
        vertexData.indices.forEach(index => {
            position.setXYZ(
                index,
                positionArray[index * 3] + vertexData.normal.x * vertexData.displacement,
                positionArray[index * 3 + 1] + vertexData.normal.y * vertexData.displacement,
                positionArray[index * 3 + 2] + vertexData.normal.z * vertexData.displacement
            );
        });
    });

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
}

function generateUVs(geometry) {
    const position = geometry.attributes.position;
    const box = new THREE.Box3().setFromBufferAttribute(position);
    const size = new THREE.Vector3();
    box.getSize(size);

    const uv = new THREE.BufferAttribute(new Float32Array(position.count * 2), 2);
    const vertexUVs = new Map();
    const positionArray = position.array;

    for (let i = 0; i < position.count; i++) {
        const x = positionArray[i * 3];
        const y = positionArray[i * 3 + 1];
        const z = positionArray[i * 3 + 2];
        
        const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
        
        if (!vertexUVs.has(key)) {
            let uvX = (x - box.min.x) / size.x;
            let uvY = (z - box.min.z) / size.z;
            
            if (displacementSettings.flipUV) {
                uvX = 1 - uvX;
                uvY = 1 - uvY;
            }
            
            vertexUVs.set(key, { x: uvX, y: uvY });
        }
        
        const uvData = vertexUVs.get(key);
        uv.setXY(i, uvData.x, uvData.y);
    }

    geometry.setAttribute('uv', uv);
    return uv;
}

function applyScaling() {
    if (mesh) {
        mesh.scale.set(scaleFactors.scaleX, scaleFactors.scaleY, scaleFactors.scaleZ);
        wireframe.scale.set(scaleFactors.scaleX, scaleFactors.scaleY, scaleFactors.scaleZ);
        updateDimensions();
    }
}

function setRotation(mesh, wireframeMesh) {
    if (!mesh || !wireframeMesh) return;
    
    const radiansX = THREE.MathUtils.degToRad(rotation.rotateX);
    const radiansY = THREE.MathUtils.degToRad(rotation.rotateY);
    const radiansZ = THREE.MathUtils.degToRad(rotation.rotateZ);

    mesh.rotation.set(radiansX, radiansY, radiansZ);
    wireframeMesh.rotation.set(radiansX, radiansY, radiansZ);
}

function downloadSTL() {
    if (!mesh) return;
    const exporter = new THREE.STLExporter();
    const stlData = exporter.parse(mesh);

    const blob = new Blob([stlData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = 'mesh.stl';
    link.click();
    document.body.removeChild(link);
}

function updateDimensions() {
    if (mesh) {
        const box = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        document.getElementById('sizeX').innerText = `Width: ${size.x.toFixed(2)} units`;
        document.getElementById('sizeY').innerText = `Height: ${size.y.toFixed(2)} units`;
        document.getElementById('sizeZ').innerText = `Depth: ${size.z.toFixed(2)} units`;
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();