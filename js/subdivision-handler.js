const SubdivisionHandler = {
    init(dependencies) {
        // Store dependencies
        this.scene = dependencies.scene;
        this.solidMaterial = dependencies.solidMaterial;
        this.wireframeMaterial = dependencies.wireframeMaterial;
        this.subdivisionSettings = dependencies.subdivisionSettings;
        this.displacementTexture = dependencies.displacementTexture;
        this.applyDisplacement = dependencies.applyDisplacement;
        this.updateDimensions = dependencies.updateDimensions;
        this.mesh = dependencies.mesh;
        this.wireframe = dependencies.wireframe;

        return this;
    },

    updateMeshReferences(mesh, wireframe) {
        this.mesh = mesh;
        this.wireframe = wireframe;
    },

    perform() {
        if (!this.mesh) return;

        try {
            // Store current states
            const currentScale = this.mesh.scale.clone();
            const currentRotation = this.mesh.rotation.clone();
            const currentPosition = this.mesh.position.clone();

            // Get the original geometry
            const geometry = this.mesh.geometry.clone();

            // Perform subdivision
            const subdivided = LoopSubdivision.modify(geometry, this.subdivisionSettings.iterations, {
                split: this.subdivisionSettings.split,
                preserveEdges: this.subdivisionSettings.preserveEdges,
                flatOnly: this.subdivisionSettings.flatOnly
            });

            // Store original positions for displacement
            subdivided.originalPositions = subdivided.attributes.position.array.slice();

            // Remove existing meshes
            this.scene.remove(this.mesh);
            this.scene.remove(this.wireframe);

            // Create new meshes with subdivided geometry
            this.mesh = new THREE.Mesh(subdivided, this.solidMaterial);
            this.wireframe = new THREE.Mesh(subdivided.clone(), this.wireframeMaterial);

            // Restore transformations
            this.mesh.scale.copy(currentScale);
            this.mesh.rotation.copy(currentRotation);
            this.mesh.position.copy(currentPosition);
            this.wireframe.scale.copy(currentScale);
            this.wireframe.rotation.copy(currentRotation);
            this.wireframe.position.copy(currentPosition);

            this.scene.add(this.mesh);
            this.scene.add(this.wireframe);

            // Reapply displacement if texture exists
            if (this.displacementTexture) {
                this.applyDisplacement();
            }

            this.updateDimensions();

            // Return the new meshes
            return {
                mesh: this.mesh,
                wireframe: this.wireframe
            };

        } catch (error) {
            console.error('Subdivision error:', error);
            return null;
        }
    },

    getMesh() {
        return this.mesh;
    },

    getWireframe() {
        return this.wireframe;
    }
};

// Expose SubdivisionHandler globally
window.SubdivisionHandler = SubdivisionHandler;