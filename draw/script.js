// Initialize the drawing functionality
const initializeDrawing = () => {
    // DOM Elements
    const modal = document.getElementById('drawingModal');
    const closeBtn = document.querySelector('.close');
    const svg = document.getElementById('drawing-area');
    const previewContainer = document.getElementById('preview-container');
    const pointDensitySlider = document.getElementById('pointDensity');
    const densityValueDisplay = document.getElementById('densityValue');
    
    // State Management
    const state = {
        currentTool: 'pen',
        isDrawing: false,
        currentShape: null,
        startPoint: null,
        pathPoints: [],
        rawPoints: [],
        shapes: [],
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        latheObject: null,
        smoothingDistance: 5,
        bezierSmoothing: true
    };

    // Tool Configuration
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

    // Utility Functions
    const getPosition = (event) => {
        const CTM = svg.getScreenCTM();
        const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
        const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);
        return {
            x: (clientX - CTM.e) / CTM.a,
            y: (clientY - CTM.f) / CTM.d
        };
    };

    const distanceBetweenPoints = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const smoothPath = (points) => {
        if (points.length < 3) return points;

        let filteredPoints = [points[0]];
        let lastPoint = points[0];

        for (let i = 1; i < points.length; i++) {
            if (distanceBetweenPoints(lastPoint, points[i]) >= state.smoothingDistance) {
                filteredPoints.push(points[i]);
                lastPoint = points[i];
            }
        }

        if (!state.bezierSmoothing) return filteredPoints;

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
    };

    // Drawing Functions
    const createShape = (point) => {
        const shapes = {
            pen: () => {
                const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
                shape.setAttribute("fill", "none");
                shape.setAttribute("stroke", "black");
                shape.setAttribute("stroke-width", "2");
                state.rawPoints = [point];
                state.pathPoints = [`M ${point.x} ${point.y}`];
                return shape;
            },
            rectangle: () => {
                const shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                shape.setAttribute("fill", "none");
                shape.setAttribute("stroke", "black");
                shape.setAttribute("stroke-width", "2");
                shape.setAttribute("x", point.x);
                shape.setAttribute("y", point.y);
                return shape;
            },
            circle: () => {
                const shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                shape.setAttribute("fill", "none");
                shape.setAttribute("stroke", "black");
                shape.setAttribute("stroke-width", "2");
                shape.setAttribute("cx", point.x);
                shape.setAttribute("cy", point.y);
                return shape;
            }
        };

        return shapes[state.currentTool] ? shapes[state.currentTool]() : null;
    };

    const updateShape = (point) => {
        const updates = {
            pen: () => {
                state.rawPoints.push(point);
                if (state.bezierSmoothing) {
                    const smoothedPath = smoothPath(state.rawPoints);
                    state.currentShape.setAttribute("d", typeof smoothedPath === 'string' ? smoothedPath : smoothedPath.join(" "));
                } else {
                    state.pathPoints.push(`L ${point.x} ${point.y}`);
                    state.currentShape.setAttribute("d", state.pathPoints.join(" "));
                }
            },
            rectangle: () => {
                const width = point.x - state.startPoint.x;
                const height = point.y - state.startPoint.y;
                state.currentShape.setAttribute("width", Math.abs(width));
                state.currentShape.setAttribute("height", Math.abs(height));
                state.currentShape.setAttribute("x", width < 0 ? point.x : state.startPoint.x);
                state.currentShape.setAttribute("y", height < 0 ? point.y : state.startPoint.y);
            },
            circle: () => {
                const radius = Math.sqrt(
                    Math.pow(point.x - state.startPoint.x, 2) + 
                    Math.pow(point.y - state.startPoint.y, 2)
                );
                state.currentShape.setAttribute("r", radius);
            }
        };

        if (updates[state.currentTool]) {
            updates[state.currentTool]();
        }
    };

    const startDrawing = (e) => {
        e.preventDefault();
        state.isDrawing = true;
        const point = getPosition(e);
        state.startPoint = point;
        state.currentShape = createShape(point);

        if (state.currentShape) {
            svg.appendChild(state.currentShape);
            state.shapes.push(state.currentShape);
        }
    };

    const draw = (e) => {
        e.preventDefault();
        if (!state.isDrawing) return;
        updateShape(getPosition(e));
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        if (state.isDrawing && state.currentTool === 'pen') {
            const finalPath = smoothPath(state.rawPoints);
            state.currentShape.setAttribute("d", typeof finalPath === 'string' ? finalPath : finalPath.join(" "));
        }
        state.isDrawing = false;
        state.currentShape = null;
        state.startPoint = null;
        state.rawPoints = [];
    };

    // 3D Preview Functions
    const init3DScene = () => {
        state.scene = new THREE.Scene();
        state.camera = new THREE.PerspectiveCamera(
            75,
            previewContainer.clientWidth / previewContainer.clientHeight,
            0.1,
            1000
        );
        
        state.renderer = new THREE.WebGLRenderer({ antialias: true });
        state.renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        state.renderer.setClearColor(0xf0f0f0);
        
        previewContainer.innerHTML = '';
        previewContainer.appendChild(state.renderer.domElement);
        
        state.controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
        state.camera.position.set(0, 0, 200);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        state.scene.add(ambientLight);
        state.scene.add(directionalLight);
        
        animate();
    };

    const animate = () => {
        requestAnimationFrame(animate);
        if (state.controls) state.controls.update();
        if (state.renderer && state.scene && state.camera) {
            state.renderer.render(state.scene, state.camera);
        }
    };

    const createLatheGeometry = () => {
        if (state.shapes.length === 0) return;

        const points = [];
        const centerX = 275;

        state.shapes.forEach(shape => {
            if (shape.tagName === 'path') {
                const pathLength = shape.getTotalLength();
                const numPoints = Math.floor(pathLength / state.smoothingDistance);
                
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

        if (state.latheObject) {
            state.scene.remove(state.latheObject);
        }

        const segments = Math.max(32, Math.floor(64 / state.smoothingDistance));
        const geometry = new THREE.LatheGeometry(points, segments);
        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshPhongMaterial({
            color: 0x808080,
            side: THREE.DoubleSide,
            flatShading: false
        });

        state.latheObject = new THREE.Mesh(geometry, material);
        state.scene.add(state.latheObject);

        const bbox = new THREE.Box3().setFromObject(state.latheObject);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        state.camera.position.set(maxDim * 2, maxDim * 2, maxDim);
        state.camera.lookAt(center);
        state.controls.target.copy(center);
        state.controls.update();
    };

    // ... previous code remains the same until exportSTL function ...

    const scaleToBox = (object, targetSize = 10) => {
        // Get the current bounding box
        const bbox = new THREE.Box3().setFromObject(object);
        const size = bbox.getSize(new THREE.Vector3());
        
        // Find the largest dimension
        const maxDimension = Math.max(size.x, size.y, size.z);
        
        // Calculate the scale factor needed
        const scaleFactor = targetSize / maxDimension;
        
        // Apply the scale
        object.scale.multiplyScalar(scaleFactor);
        
        // Update the bounding box after scaling
        bbox.setFromObject(object);
        
        // Center the object
        const center = bbox.getCenter(new THREE.Vector3());
        object.position.sub(center);
        
        return object;
    };

    const exportSTL = () => {
        if (!state.latheObject) return;
        
        // Create a copy of the lathe object for export
        const exportObject = state.latheObject.clone();
        
        // Scale the copy to 10x10x10 bounding box
        scaleToBox(exportObject, 10);
        
        // Create a temporary scene for the scaled object
        const exportScene = new THREE.Scene();
        exportScene.add(exportObject);
        
        const exporter = new THREE.STLExporter();
        const stlString = exporter.parse(exportScene);
        
        // Clean up
        exportScene.remove(exportObject);
        exportObject.geometry.dispose();
        exportObject.material.dispose();
        
        const blob = new Blob([stlString], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.stl';
        a.click();
        URL.revokeObjectURL(url);
    };

    // ... rest of the code remains the same ...

    const exportSVG = () => {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    // UI Functions
    const clearCanvas = () => {
        state.shapes.forEach(shape => shape.remove());
        state.shapes = [];
        state.pathPoints = [];
        state.rawPoints = [];
        
        if (previewContainer.style.display === 'block') {
            previewContainer.style.display = 'none';
            svg.style.display = 'block';
        }
        
        if (state.renderer) {
            state.renderer.dispose();
            state.renderer = null;
        }
        
        if (tools.exportSTL) {
            tools.exportSTL.style.display = 'none';
        }
    };

    const show3DPreview = () => {
        if (state.shapes.length === 0) {
            alert('Please draw something first');
            return;
        }

        svg.style.display = 'none';
        previewContainer.style.display = 'block';
        if (tools.exportSTL) {
            tools.exportSTL.style.display = 'inline-block';
        }

        if (!state.renderer) {
            init3DScene();
        }
        createLatheGeometry();
    };

    // Event Listeners
    const addEventListeners = () => {
        // Touch events
        svg.addEventListener('touchstart', startDrawing, { passive: false });
        svg.addEventListener('touchmove', draw, { passive: false });
        svg.addEventListener('touchend', stopDrawing, { passive: false });
        svg.addEventListener('touchcancel', stopDrawing, { passive: false });

        // Mouse events
        svg.addEventListener('mousedown', startDrawing);
        svg.addEventListener('mousemove', draw);
        svg.addEventListener('mouseup', stopDrawing);
        svg.addEventListener('mouseleave', stopDrawing);

        // Tool selection
        Object.entries(tools).forEach(([name, button]) => {
            if (!button) return;
            button.addEventListener('click', () => {
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
                state.currentTool = name;
                Object.values(tools).forEach(b => b?.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Point density control
        if (pointDensitySlider) {
            pointDensitySlider.addEventListener('input', (e) => {
                state.smoothingDistance = parseInt(e.target.value);
                densityValueDisplay.textContent = `${state.smoothingDistance}px`;
                
                if (state.currentShape && state.currentTool === 'pen' && state.rawPoints.length > 0) {
                    const smoothedPath = smoothPath(state.rawPoints);
                    state.currentShape.setAttribute("d", typeof smoothedPath === 'string' ? smoothedPath : smoothedPath.join(" "));
                }
            });
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            if (state.renderer) {
                state.camera.aspect = previewContainer.clientWidth / previewContainer.clientHeight;
                state.camera.updateProjectionMatrix();
                state.renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
            }
        });
    };

    // Initialize the application
    const initialize = () => {
        // Set pen tool as active by default
        if (tools.pen) tools.pen.classList.add('active');
        
        // Add all event listeners
        addEventListeners();
    };

    // Start the application
    initialize();
};

// Initialize when imported
initializeDrawing();

// Export for use in other modules
export default initializeDrawing;