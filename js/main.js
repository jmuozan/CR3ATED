// File: js/main.js
class CR3ATDR {
    constructor() {
        // Initialize managers
        this.initializeManagers();
        
        // Setup initial state
        this.state = {
            isWireframeVisible: false,
            isAnimating: true
        };

        // Setup GUI with initial settings
        this.setupGUIControls();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
    }

    initializeManagers() {
        // Scene management
        this.sceneManager = new CR3ATDR_SceneManager();
        
        // Geometry and mesh handling
        this.geometryManager = new CR3ATDR_GeometryManager();
        this.meshManager = new CR3ATDR_MeshManager(this.sceneManager.scene);
        
        // Lighting setup
        this.lightingManager = new CR3ATDR_LightingManager(this.sceneManager.scene);
        
        // File handling
        this.fileManager = new CR3ATDR_FileManager({
            meshManager: this.meshManager,
            geometryManager: this.geometryManager
        });
    }

    setupGUIControls() {
        const settings = this.createDefaultSettings();
        const callbacks = this.createGUICallbacks();
        
        this.guiManager = new CR3ATDR_GuiManager(settings, callbacks);
        
        // Setup specific control folders
        this.setupTransformControls();
        this.setupDisplacementControls();
        this.setupSubdivisionControls();
        this.setupDisplayControls();
    }

    createDefaultSettings() {
        return {
            transform: {
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: -90, y: 0, z: 0 },
                position: { x: 0, y: 0, z: 0 }
            },
            displacement: {
                scale: 0.1,
                invert: false,
                flipUV: false
            },
            subdivision: {
                iterations: 1,
                split: false,
                preserveEdges: true,
                flatOnly: false
            },
            display: {
                wireframe: false,
                autoRotate: false,
                showBoundingBox: false
            }
        };
    }

    createGUICallbacks() {
        return {
            onToggleWireframe: () => this.toggleWireframe(),
            onUploadSTL: () => document.getElementById('stlFile').click(),
            onUploadImage: () => document.getElementById('imageFile').click(),
            onDownloadSTL: () => this.downloadCurrentMesh(),
            onCenterCamera: () => this.centerCamera(),
            onResetModel: () => this.resetModel(),
            onAutoRotate: (value) => this.toggleAutoRotate(value)
        };
    }

    setupTransformControls() {
        const transformFolder = this.guiManager.gui.addFolder('Transform');
        
        // Scale controls
        const scale = this.meshManager.getScale();
        ['x', 'y', 'z'].forEach(axis => {
            transformFolder.add(scale, axis, 0.1, 10)
                .onChange(() => this.meshManager.updateScale(scale));
        });

        // Rotation controls
        const rotation = this.meshManager.getRotation();
        ['x', 'y', 'z'].forEach(axis => {
            transformFolder.add(rotation, axis, -180, 180)
                .onChange(() => this.meshManager.updateRotation(rotation));
        });

        transformFolder.open();
    }

    setupDisplacementControls() {
        const dispFolder = this.guiManager.gui.addFolder('Displacement');
        const settings = this.geometryManager.displacementSettings;

        dispFolder.add(settings, 'scale', 0, 1)
            .onChange(() => this.updateDisplacement());
        dispFolder.add(settings, 'invert')
            .onChange(() => this.updateDisplacement());
        dispFolder.add(settings, 'flipUV')
            .onChange(() => this.updateDisplacement());
        
        dispFolder.open();
    }

    setupSubdivisionControls() {
        const subFolder = this.guiManager.gui.addFolder('Subdivision');
        const settings = {
            iterations: 1,
            split: false,
            preserveEdges: true,
            flatOnly: false,
            apply: () => this.performSubdivision()
        };

        subFolder.add(settings, 'iterations', 1, 6, 1);
        subFolder.add(settings, 'split');
        subFolder.add(settings, 'preserveEdges');
        subFolder.add(settings, 'flatOnly');
        subFolder.add(settings, 'apply').name('Apply Subdivision');
        
        this.subdivisionSettings = settings;
        subFolder.open();
    }

    setupDisplayControls() {
        const displayFolder = this.guiManager.gui.addFolder('Display');
        const settings = this.state;

        displayFolder.add(settings, 'isWireframeVisible')
            .name('Wireframe')
            .onChange(() => this.toggleWireframe());
            
        displayFolder.add(settings, 'isAnimating')
            .name('Auto Rotate')
            .onChange(() => this.toggleAutoRotate());
            
        displayFolder.open();
    }

    setupEventListeners() {
        // Window resize handling
        window.addEventListener('resize', () => this.handleResize());

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Drag and drop support
        this.setupDragAndDrop();
    }

    handleResize() {
        this.sceneManager.handleResize();
    }

    handleKeyboardShortcuts(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.toggleWireframe();
                break;
            case 'r':
                this.resetModel();
                break;
            case 'c':
                this.centerCamera();
                break;
            case 's':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.downloadCurrentMesh();
                }
                break;
        }
    }

    setupDragAndDrop() {
        const dropZone = this.sceneManager.renderer.domElement;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.name.toLowerCase().endsWith('.stl')) {
                    this.fileManager.handleSTLUpload({ target: { files: [file] } });
                } else if (file.type.startsWith('image/')) {
                    this.fileManager.handleImageUpload({ target: { files: [file] } });
                }
            }
        });
    }

    updateDisplacement() {
        if (this.meshManager.hasActiveMesh()) {
            this.geometryManager.applyDisplacement(this.meshManager.getCurrentGeometry());
        }
    }

    performSubdivision() {
        if (this.meshManager.hasActiveMesh()) {
            const geometry = this.meshManager.getCurrentGeometry();
            const subdivided = this.geometryManager.performSubdivision(
                geometry, 
                this.subdivisionSettings
            );
            
            if (subdivided) {
                this.meshManager.updateGeometry(subdivided);
                this.updateDisplacement();
            }
        }
    }

    toggleWireframe() {
        this.state.isWireframeVisible = !this.state.isWireframeVisible;
        this.meshManager.toggleWireframe(this.state.isWireframeVisible);
    }

    toggleAutoRotate() {
        this.state.isAnimating = !this.state.isAnimating;
        this.sceneManager.controls.autoRotate = this.state.isAnimating;
    }

    centerCamera() {
        if (this.meshManager.hasActiveMesh()) {
            const dimensions = this.geometryManager.calculateDimensions(
                this.meshManager.getCurrentGeometry()
            );
            this.sceneManager.focusCamera(dimensions.center, dimensions);
        }
    }

    resetModel() {
        if (this.meshManager.hasActiveMesh()) {
            this.geometryManager.resetGeometry(this.meshManager.getCurrentGeometry());
            this.meshManager.resetTransforms();
            this.centerCamera();
            this.updateGUIValues();
        }
    }

    downloadCurrentMesh() {
        if (this.meshManager.hasActiveMesh()) {
            this.fileManager.downloadSTL(
                this.meshManager.getCurrentMesh(),
                'cr3atdr_export.stl'
            );
        }
    }

    updateGUIValues() {
        // Update GUI controllers to match current state
        this.guiManager.updateDisplays();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.state.isAnimating) {
            this.sceneManager.controls.update();
        }
        
        this.sceneManager.render();
    }

    // Utility methods for external access
    getState() {
        return { ...this.state };
    }

    getMeshManager() {
        return this.meshManager;
    }

    getGeometryManager() {
        return this.geometryManager;
    }

    getSceneManager() {
        return this.sceneManager;
    }
}

// Initialize application when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new CR3ATDR();
    
    // Make app accessible for debugging
    window.cr3atdr = app;
});