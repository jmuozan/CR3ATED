// scene-manager.js
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = this.setupCamera();
        this.renderer = this.setupRenderer();
        this.controls = this.setupControls();
        this.setupLights();
        this.materials = this.setupMaterials();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        return camera;
    }

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff);
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    setupControls() {
        return new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    setupLights() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        // Directional Lights
        const directions = [
            { pos: [0, 5, 5] },
            { pos: [-5, 5, 5] },
            { pos: [5, -5, 5] },
            { pos: [5, 5, -5] }
        ];

        directions.forEach(dir => {
            const light = new THREE.DirectionalLight(0xffffff, 0.5);
            light.position.set(...dir.pos);
            this.scene.add(light);
        });

        // Point Light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 0, 20);
        this.scene.add(pointLight);
    }

    setupMaterials() {
        return {
            solid: new THREE.MeshPhongMaterial({ color: 0x0077ff }),
            wireframe: new THREE.MeshBasicMaterial({ 
                color: 0x000000, 
                wireframe: true 
            })
        };
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Helper methods
    addToScene(object) {
        this.scene.add(object);
    }

    removeFromScene(object) {
        this.scene.remove(object);
    }

    getCameraDistance(boundingBox) {
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        return (maxDim / 2) / Math.tan(fov / 2) * 1.5;
    }

    centerCamera(mesh) {
        if (!mesh) return;
        
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const cameraDistance = this.getCameraDistance(boundingBox);
        
        this.camera.position.set(
            cameraDistance * 0.5,
            cameraDistance * 0.5,
            cameraDistance
        );
        this.controls.target.copy(center);
        
        this.controls.update();
        this.camera.updateProjectionMatrix();
    }
}

// Export the SceneManager
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SceneManager;
} else {
    window.SceneManager = SceneManager;
}