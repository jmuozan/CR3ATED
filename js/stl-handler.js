const STLHandler = {
    init(dependencies) {
        // Store dependencies
        this.scene = dependencies.scene;
        this.solidMaterial = dependencies.solidMaterial;
        this.wireframeMaterial = dependencies.wireframeMaterial;
        this.rotation = dependencies.rotation;
        this.rotationFolder = dependencies.rotationFolder;
        this.applyScaling = dependencies.applyScaling;
        this.applyDisplacement = dependencies.applyDisplacement;
        this.updateDimensions = dependencies.updateDimensions;
        this.centerCamera = dependencies.centerCamera;
        
        // Store mesh references
        this.mesh = null;
        this.wireframe = null;

        return this;
    },

    handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => this.processSTL(e.target.result);
        reader.readAsArrayBuffer(file);
    },

    processSTL(data) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(data);

        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.scene.remove(this.wireframe);
        }

        geometry.computeVertexNormals();
        
        // Store original positions
        geometry.originalPositions = geometry.attributes.position.array.slice();

        this.mesh = new THREE.Mesh(geometry, this.solidMaterial);
        this.wireframe = new THREE.Mesh(geometry.clone(), this.wireframeMaterial);
        this.wireframe.visible = false;

        // Rotate mesh to make Z vertical
        this.mesh.rotation.x = -Math.PI / 2;
        this.wireframe.rotation.x = -Math.PI / 2;

        this.scene.add(this.mesh);
        this.scene.add(this.wireframe);

        // Reset rotation values in the GUI
        this.rotation.rotateX = -90;
        this.rotation.rotateY = 0;
        this.rotation.rotateZ = 0;

        // Update GUI controllers
        for (let i in this.rotationFolder.__controllers) {
            this.rotationFolder.__controllers[i].updateDisplay();
        }

        // Apply transformations and updates
        this.applyScaling();
        this.applyDisplacement();
        this.updateDimensions();
        this.centerCamera();
    },

    getMesh() {
        return this.mesh;
    },

    getWireframe() {
        return this.wireframe;
    }
};

// Expose STLHandler globally
window.STLHandler = STLHandler;