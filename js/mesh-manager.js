// File: js/mesh-manager.js
class CR3ATDR_MeshManager {
    constructor(scene) {
        this.scene = scene;
        this.setupMaterials();
    }

    setupMaterials() {
        this.materials = {
            solid: new THREE.MeshPhongMaterial(CR3ATDR_CONFIG.MATERIALS.SOLID),
            wireframe: new THREE.MeshBasicMaterial({
                ...CR3ATDR_CONFIG.MATERIALS.WIREFRAME,
                wireframe: true
            })
        };
    }

    createMeshes(geometry) {
        this.mesh = new THREE.Mesh(geometry, this.materials.solid);
        this.wireframe = new THREE.Mesh(geometry.clone(), this.materials.wireframe);
        this.wireframe.visible = false;
        
        this.scene.add(this.mesh);
        this.scene.add(this.wireframe);
    }

    updateScale(scale) {
        if (this.mesh) {
            this.mesh.scale.set(scale.x, scale.y, scale.z);
            this.wireframe.scale.set(scale.x, scale.y, scale.z);
        }
    }

    updateRotation(rotation) {
        if (this.mesh) {
            this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
            this.wireframe.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }
}