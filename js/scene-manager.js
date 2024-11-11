// File: js/scene-manager.js
class CR3ATDR_SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
    }

    setupCamera() {
        const { FOV, NEAR, FAR, INITIAL_POSITION } = CR3ATDR_CONFIG.CAMERA;
        this.camera = new THREE.PerspectiveCamera(
            FOV, window.innerWidth / window.innerHeight, NEAR, FAR
        );
        this.camera.position.set(
            INITIAL_POSITION.x, INITIAL_POSITION.y, INITIAL_POSITION.z
        );
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff);
        document.body.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
