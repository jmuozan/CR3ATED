document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modal = document.getElementById('drawingModal');
    const openBtn = document.getElementById('openDrawing');
    const closeBtn = document.querySelector('.close');
    const svg = document.getElementById('drawing-area');
    const previewContainer = document.getElementById('preview-container');
    
    // Tool buttons
    const tools = {
        pen: document.getElementById('penTool'),
        rectangle: document.getElementById('rectangleTool'),
        circle: document.getElementById('circleTool'),
        smooth: document.getElementById('smoothTool'),
        clear: document.getElementById('clearCanvas'),
        exportSvg: document.getElementById('exportSVG'),
        preview3D: document.getElementById('preview3D'),
        exportSTL: document.getElementById('exportSTL')
    };

    // State variables
    let currentTool = 'pen';
    let isDrawing = false;
    let currentShape = null;
    let startPoint = null;
    let pathPoints = [];
    let shapes = [];

    // Three.js variables
    let scene, camera, renderer, controls, latheObject;

    // Modal controls
    openBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => {
        modal.style.display = "none";
        if (renderer) renderer.dispose();
    };
    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
            if (renderer) renderer.dispose();
        }
    };

    // Tool selection
    Object.entries(tools).forEach(([name, button]) => {
        if (!button) return;
        button.onclick = () => {
            if (name === 'clear') {
                clearCanvas();
                return;
            }
            if (name === 'preview3D') {
                show3DPreview();
                return;
            }
            if (name === 'exportSTL') {
                exportSTL();
                return;
            }
            if (name === 'exportSvg') {
                exportSVG();
                return;
            }
            currentTool = name;
            Object.values(tools).forEach(b => b?.classList.remove('active'));
            button.classList.add('active');
        };
    });

    // Get mouse position relative to SVG
    function getMousePosition(event) {
        const CTM = svg.getScreenCTM();
        return {
            x: (event.clientX - CTM.e) / CTM.a,
            y: (event.clientY - CTM.f) / CTM.d
        };
    }

    // Drawing Functions
    function startDrawing(e) {
        isDrawing = true;
        const point = getMousePosition(e);
        startPoint = point;

        switch (currentTool) {
            case 'pen':
                currentShape = document.createElementNS("http://www.w3.org/2000/svg", "path");
                currentShape.setAttribute("fill", "none");
                currentShape.setAttribute("stroke", "black");
                currentShape.setAttribute("stroke-width", "2");
                pathPoints = [`M ${point.x} ${point.y}`];
                break;
            case 'rectangle':
                currentShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                currentShape.setAttribute("fill", "none");
                currentShape.setAttribute("stroke", "black");
                currentShape.setAttribute("stroke-width", "2");
                currentShape.setAttribute("x", point.x);
                currentShape.setAttribute("y", point.y);
                break;
            case 'circle':
                currentShape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                currentShape.setAttribute("fill", "none");
                currentShape.setAttribute("stroke", "black");
                currentShape.setAttribute("stroke-width", "2");
                currentShape.setAttribute("cx", point.x);
                currentShape.setAttribute("cy", point.y);
                break;
        }

        if (currentShape) {
            svg.appendChild(currentShape);
            shapes.push(currentShape);
        }
    }

    function draw(e) {
        if (!isDrawing) return;
        const point = getMousePosition(e);

        switch (currentTool) {
            case 'pen':
                pathPoints.push(`L ${point.x} ${point.y}`);
                currentShape.setAttribute("d", pathPoints.join(" "));
                break;
            case 'rectangle':
                const width = point.x - startPoint.x;
                const height = point.y - startPoint.y;
                currentShape.setAttribute("width", Math.abs(width));
                currentShape.setAttribute("height", Math.abs(height));
                currentShape.setAttribute("x", width < 0 ? point.x : startPoint.x);
                currentShape.setAttribute("y", height < 0 ? point.y : startPoint.y);
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(point.x - startPoint.x, 2) + 
                    Math.pow(point.y - startPoint.y, 2)
                );
                currentShape.setAttribute("r", radius);
                break;
        }
    }

    function stopDrawing() {
        isDrawing = false;
        currentShape = null;
        startPoint = null;
    }

    // Clear canvas
    function clearCanvas() {
        shapes.forEach(shape => shape.remove());
        shapes = [];
        pathPoints = [];
        if (previewContainer.style.display === 'block') {
            previewContainer.style.display = 'none';
            svg.style.display = 'block';
        }
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        tools.exportSTL.style.display = 'none';
    }

    // 3D Preview Functions
    function init3DScene() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, previewContainer.clientWidth / previewContainer.clientHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        renderer.setClearColor(0xf0f0f0);
        previewContainer.innerHTML = '';
        previewContainer.appendChild(renderer.domElement);
        
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        camera.position.set(0, 0, 200);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(ambientLight);
        scene.add(directionalLight);
        
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function createLatheGeometry() {
        if (shapes.length === 0) return;

        const points = [];
        const centerX = 275; // Center line x-coordinate

        shapes.forEach(shape => {
            if (shape.tagName === 'path') {
                const pathData = shape.getAttribute('d');
                const pathPoints = pathData.split(/[ML]\s*/).filter(Boolean);
                pathPoints.forEach(point => {
                    const [x, y] = point.split(/\s+/).map(Number);
                    // Only use points on the right side of center line
                    if (x >= centerX) {
                        points.push(new THREE.Vector2(x - centerX, y));
                    }
                });
            }
        });

        if (points.length < 2) {
            alert('Please draw a profile on the right side of the center line');
            return;
        }

        // Sort points by Y coordinate
        points.sort((a, b) => a.y - b.y);

        if (latheObject) {
            scene.remove(latheObject);
        }

        const geometry = new THREE.LatheGeometry(points, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            side: THREE.DoubleSide,
            flatShading: false
        });

        latheObject = new THREE.Mesh(geometry, material);
        scene.add(latheObject);

        // Center camera on object
        const bbox = new THREE.Box3().setFromObject(latheObject);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(maxDim * 2, maxDim, maxDim * 2);
        camera.lookAt(center);
        controls.target.copy(center);
        controls.update();
    }

    function show3DPreview() {
        if (shapes.length === 0) {
            alert('Please draw something first');
            return;
        }

        svg.style.display = 'none';
        previewContainer.style.display = 'block';
        tools.exportSTL.style.display = 'inline-block';

        if (!renderer) {
            init3DScene();
        }
        createLatheGeometry();
    }

    // Export functions
    function exportSTL() {
        if (!latheObject) return;
        
        const exporter = new THREE.STLExporter();
        const stlString = exporter.parse(scene);
        
        const blob = new Blob([stlString], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.stl';
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportSVG() {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Event Listeners
    svg.addEventListener('mousedown', startDrawing);
    svg.addEventListener('mousemove', draw);
    svg.addEventListener('mouseup', stopDrawing);
    svg.addEventListener('mouseleave', stopDrawing);

    // Window resize handler
    window.addEventListener('resize', () => {
        if (renderer) {
            camera.aspect = previewContainer.clientWidth / previewContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        }
    });

    // Set pen tool as active by default
    tools.pen.classList.add('active');
});