// File: js/file-manager.js
class CR3ATDR_FileManager {
    constructor(callbacks) {
        this.setupFileInputs();
        this.meshManager = callbacks.meshManager;
        this.geometryManager = callbacks.geometryManager;
        this.loader = new THREE.STLLoader();
        this.exporter = new THREE.STLExporter();
        this.textureLoader = new THREE.TextureLoader();
    }

    setupFileInputs() {
        this.stlInput = document.getElementById('stlFile');
        this.imageInput = document.getElementById('imageFile');
        
        this.stlInput.addEventListener('change', (e) => this.handleSTLUpload(e));
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    handleSTLUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const geometry = this.loader.parse(e.target.result);
                this.processUploadedGeometry(geometry);
            } catch (error) {
                console.error('Error loading STL:', error);
                alert('Error loading STL file. Please check the file format.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    processUploadedGeometry(geometry) {
        // Store original positions for reset capability
        geometry.originalPositions = geometry.attributes.position.array.slice();
        
        // Compute necessary attributes
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        
        // Generate UVs if they don't exist
        if (!geometry.attributes.uv) {
            this.geometryManager.generateUVs(geometry);
        }

        // Update mesh
        this.meshManager.createMeshes(geometry);
        
        // Center the camera on the new geometry
        this.meshManager.centerCamera();
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        
        this.textureLoader.load(
            url,
            (texture) => {
                this.geometryManager.setDisplacementTexture(texture);
                URL.revokeObjectURL(url);
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
                alert('Error loading image file. Please check the file format.');
                URL.revokeObjectURL(url);
            }
        );
    }

    downloadSTL(mesh, filename = 'model.stl') {
        if (!mesh) {
            console.warn('No mesh available to download');
            return;
        }

        try {
            const stlData = this.exporter.parse(mesh);
            const blob = new Blob([stlData], { type: 'application/octet-stream' });
            const link = document.createElement('a');
            
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error exporting STL:', error);
            alert('Error creating STL file. Please try again.');
        }
    }

    // Helper method to check if file type is supported
    isFileTypeSupported(file, allowedTypes) {
        return allowedTypes.includes(file.type) || 
               allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
    }
}