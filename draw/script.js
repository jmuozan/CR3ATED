// Initialize the drawing functionality
const initializeDrawing = () => {
    // DOM Elements
    const modal = document.getElementById('drawingModal');
    const closeBtn = document.querySelector('.close');
    const svg = document.getElementById('drawing-area');
    const previewContainer = document.getElementById('preview-container');
    const pointDensitySlider = document.getElementById('pointDensity');
    const densityValueDisplay = document.getElementById('densityValue');
    
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
    let rawPoints = [];
    let shapes = [];

    // Three.js variables
    let scene, camera, renderer, controls, latheObject;

    // Smoothing configuration
    let SMOOTHING_DISTANCE = 5;
    const BEZIER_SMOOTHING = true;

    // Point density control
    if (pointDensitySlider) {
        pointDensitySlider.addEventListener('input', function(e) {
            SMOOTHING_DISTANCE = parseInt(e.target.value);
            densityValueDisplay.textContent = `${SMOOTHING_DISTANCE}px`;
            
            if (currentShape && currentTool === 'pen' && rawPoints.length > 0) {
                const smoothedPath = smoothPath(rawPoints);
                currentShape.setAttribute("d", typeof smoothedPath === 'string' ? smoothedPath : smoothedPath.join(" "));
            }
        });
    }

    // Utility Functions
    function distanceBetweenPoints(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    function smoothPath(points) {
        if (points.length < 3) return points;

        let filteredPoints = [points[0]];
        let lastPoint = points[0];

        for (let i = 1; i < points.length; i++) {
            if (distanceBetweenPoints(lastPoint, points[i]) >= SMOOTHING_DISTANCE) {
                filteredPoints.push(points[i]);
                lastPoint = points[i];
            }
        }

        if (!BEZIER_SMOOTHING) return filteredPoints;

        let smoothedPath = `M ${filteredPoints[0].x} ${filteredPoints[0].y}`;
        
        for (let i = 1; i < filteredPoints.length - 2; i++) {
            const p0 = filteredPoints[i - 1];
            const p1 = filteredPoints[i];
            const p2 = filteredPoints[i + 1];
            
            const controlPoint1 = {
                x: p1.x - (p2.x - p0.x) / 6,
                y: p1.y - (p2.y - p0.y) / 6
            };
            const controlPoint2 = {
                x: p2.x + (p1.x - p2.x) / 6,
                y: p2.y + (p1.y - p2.y) / 6
            };
            
            smoothedPath += ` C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${p2.x},${p2.y}`;
        }

        if (filteredPoints.length > 2) {
            const lastPoints = filteredPoints.slice(-2);
            smoothedPath += ` L ${lastPoints[0].x},${lastPoints[0].y} L ${lastPoints[1].x},${lastPoints[1].y}`;
        }

        return smoothedPath;
    }

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
                rawPoints = [point];
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
                rawPoints.push(point);
                if (BEZIER_SMOOTHING) {
                    const smoothedPath = smoothPath(rawPoints);
                    currentShape.setAttribute("d", typeof smoothedPath === 'string' ? smoothedPath : smoothedPath.join(" "));
                } else {
                    pathPoints.push(`L ${point.x} ${point.y}`);
                    currentShape.setAttribute("d", pathPoints.join(" "));
                }
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
        if (isDrawing && currentTool === 'pen') {
            const finalPath = smoothPath(rawPoints);
            currentShape.setAttribute("d", typeof finalPath === 'string' ? finalPath : finalPath.join(" "));
        }
        isDrawing = false;
        currentShape = null;
        startPoint = null;
        rawPoints = [];
    }

    function clearCanvas() {
        shapes.forEach(shape => shape.remove());
        shapes = [];
        pathPoints = [];
        rawPoints = [];
        if (previewContainer.style.display === 'block') {
            previewContainer.style.display = 'none';
            svg.style.display = 'block';
        }
        if (renderer) {
            renderer.dispose();
            renderer = null;
        }
        if (tools.exportSTL) tools.exportSTL.style.display = 'none';
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
        const centerX = 275;

        shapes.forEach(shape => {
            if (shape.tagName === 'path') {
                const pathLength = shape.getTotalLength();
                const numPoints = Math.floor(pathLength / SMOOTHING_DISTANCE);
                
                for (let i = 0; i <= numPoints; i++) {
                    const point = shape.getPointAtLength((i / numPoints) * pathLength);
                    if (point.x >= centerX) {
                        points.push(new THREE.Vector2(point.x - centerX, point.y));
                    }
                }
            }
        });

        if (points.length < 2) {
            alert('Please draw a profile on the right side of the center line');
            return;
        }

        points.sort((a, b) => a.y - b.y);

        if (latheObject) {
            scene.remove(latheObject);
        }

        const segments = Math.max(32, Math.floor(64 / SMOOTHING_DISTANCE));
        const geometry = new THREE.LatheGeometry(points, segments);
        
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            side: THREE.DoubleSide,
            flatShading: false
        });

        latheObject = new THREE.Mesh(geometry, material);
        scene.add(latheObject);

        const bbox = new THREE.Box3().setFromObject(latheObject);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(maxDim * 2, maxDim * 2, maxDim);
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
        if (tools.exportSTL) tools.exportSTL.style.display = 'inline-block';

        if (!renderer) {
            init3DScene();
        }
        createLatheGeometry();
    }

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
    if (tools.pen) tools.pen.classList.add('active');
};

// Initialize when imported
initializeDrawing();

// Export for use in other modules
export default initializeDrawing;