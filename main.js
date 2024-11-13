import { performSubdivision } from './js/performSubdivision.js';
import { handleSTLUpload, downloadSTL } from './js/handleSTLUpload.js';
import { applyDisplacement } from './js/displacementMap.js';

let currentMesh = null;
let currentWireframe = null;


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
            mesh: currentMesh,
            wireframe: currentWireframe,
            scene,
            solidMaterial,
            wireframeMaterial,
            subdivisionSettings: this,
            displacementTexture,
            updateDimensions,
            applyDisplacement
        });
        
        if (result) {
            currentMesh = result.mesh;
            currentWireframe = result.wireframe;
            mesh = currentMesh;  // Update the global mesh reference
            wireframe = currentWireframe;  // Update the global wireframe reference
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
displacementFolder.add(displacementSettings, 'displacementScale', 0, 1, 0.01).onChange(() => {
    applyDisplacement({
        currentMesh,
        currentWireframe,
        displacementTexture,
        displacementSettings
    });
});
displacementFolder.add(displacementSettings, 'invertDisplacement').onChange(() => {
    applyDisplacement({
        currentMesh,
        currentWireframe,
        displacementTexture,
        displacementSettings
    });
});
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
addGUIMenuButton(gui, 'Download STL', () => downloadSTL(currentMesh));
addGUIMenuButton(gui, 'Center Camera', centerCamera);

// Open folders by default
scaleFolder.open();
displacementFolder.open();
rotationFolder.open();
subdivisionFolder.open();

// Event Listeners
document.getElementById('stlFile').addEventListener('change', (event) => {
    const result = handleSTLUpload({
        event,
        scene,
        mesh: currentMesh,
        wireframe: currentWireframe,
        solidMaterial,
        wireframeMaterial,
        rotation,
        rotationFolder,
        applyScaling,
        applyDisplacement,
        updateDimensions,
        centerCamera,
        currentMesh,
        currentWireframe,
        displacementTexture,
        displacementSettings
    });
    
    if (result && result.onload) {
        result.onload((newMesh, newWireframe) => {
            currentMesh = newMesh;
            currentWireframe = newWireframe;
            mesh = currentMesh;  // Update the global mesh reference
            wireframe = currentWireframe;  // Update the global wireframe reference
        });
    }
});
document.getElementById('imageFile').addEventListener('change', handleImageUpload);

function reapplyDisplacement() {
    if (currentMesh && displacementTexture) {
        applyDisplacement({
            currentMesh,
            currentWireframe,
            displacementTexture,
            displacementSettings
        });
    }
}

function addGUIMenuButton(gui, name, onClickCallback) {
    const obj = { [name]: onClickCallback };
    gui.add(obj, name);
}

function centerCamera() {
    if (!mesh) return;
    
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.5;
    
    camera.position.set(cameraDistance * 0.5, cameraDistance * 0.5, cameraDistance);
    controls.target.copy(center);
    
    controls.update();
    camera.updateProjectionMatrix();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            displacementTexture = texture;
            applyDisplacement({
                currentMesh,
                currentWireframe,
                displacementTexture,
                displacementSettings
            });
        });
    }
}

function toggleWireframe() {
    if (wireframe) {
        wireframe.visible = !wireframe.visible;
    }
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