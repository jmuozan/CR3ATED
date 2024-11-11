// File: js/config.js
const CR3ATDR_CONFIG = {
    GUI: {
        SCALE_RANGE: { min: 0.1, max: 10, step: 0.01 },
        ROTATION_RANGE: { min: -180, max: 180, step: 30 },
        DISPLACEMENT_RANGE: { min: 0, max: 1, step: 0.01 },
        SUBDIVISION_RANGE: { min: 1, max: 6, step: 1 }
    },
    CAMERA: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        INITIAL_POSITION: { x: 0, y: 0, z: 5 }
    },
    MATERIALS: {
        SOLID: { color: 0x0077ff },
        WIREFRAME: { color: 0x000000 }
    },
    LIGHTING: {
        AMBIENT: { color: 0x404040, intensity: 2 },
        DIRECTIONAL: { color: 0xffffff, intensity: 0.5 },
        POINT: { color: 0xffffff, intensity: 0.5 }
    }
};