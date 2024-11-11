// File: js/lighting.js
class CR3ATDR_LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.setupLighting();
    }

    setupLighting() {
        this.setupAmbientLight();
        this.setupDirectionalLights();
        this.setupPointLight();
    }

    setupAmbientLight() {
        const { color, intensity } = CR3ATDR_CONFIG.LIGHTING.AMBIENT;
        const ambientLight = new THREE.AmbientLight(color, intensity);
        this.scene.add(ambientLight);
    }

    setupDirectionalLights() {
        const positions = [
            [0, 5, 5],
            [-5, 5, 5],
            [5, -5, 5],
            [5, 5, -5]
        ];

        positions.forEach(pos => {
            const light = new THREE.DirectionalLight(
                CR3ATDR_CONFIG.LIGHTING.DIRECTIONAL.color,
                CR3ATDR_CONFIG.LIGHTING.DIRECTIONAL.intensity
            );
            light.position.set(...pos);
            this.scene.add(light);
        });
    }

    setupPointLight() {
        const light = new THREE.PointLight(
            CR3ATDR_CONFIG.LIGHTING.POINT.color,
            CR3ATDR_CONFIG.LIGHTING.POINT.intensity
        );
        light.position.set(0, 0, 20);
        this.scene.add(light);
    }
}
