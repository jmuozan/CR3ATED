import { initializeScene } from './js/sceneSetup.js';
import { createMaterials, toggleWireframe } from './js/materials.js';
import { initializeGUI } from './js/guiSetup.js';
import { createDefaultSettings } from './js/settings.js';
import { handleSTLUpload, downloadSTL } from './js/handleSTLUpload.js';
import { handleImageUpload } from './js/imageHandler.js';
import { performSubdivision } from './js/performSubdivision.js';
import { applyDisplacement } from './js/displacementMap.js';
import { applyScaling, updateDimensions } from './js/scaling.js';
import { centerCamera, setRotation } from './js/cameraControls.js';

// Initialize scene and materials
const { scene, camera, renderer, controls } = initializeScene();
const { solidMaterial, wireframeMaterial } = createMaterials();

// State variables
let currentMesh = null;
let currentWireframe = null;
let mesh = null;  // Keep for backwards compatibility during refactor
let wireframe = null;  // Keep for backwards compatibility during refactor
let displacementTexture = null;

// Create settings
const { scaleFactors, displacementSettings, rotation, subdivisionSettings } = createDefaultSettings();

// Function to reapply displacement when settings change
function reapplyDisplacement() {
    if (currentMesh && displacementTexture) {
        applyDisplacement({
            currentMesh,
            currentWireframe,
            displacementTexture,
            displacementSettings
        });
    }
}

// Setup GUI with callbacks
const { gui, rotationFolder } = initializeGUI({
    scaleFactors,
    displacementSettings,
    rotation,
    subdivisionSettings,
    onScaleChange: () => applyScaling({
        currentMesh,
        currentWireframe,
        scaleFactors,
        updateDimensions: () => updateDimensions(currentMesh)
    }),
    onDisplacementChange: reapplyDisplacement,
    onRotationChange: () => setRotation({
        mesh: currentMesh, 
        wireframe: currentWireframe, 
        rotation
    }),
    onSubdivisionChange: () => {
        const result = performSubdivision({
            mesh: currentMesh,
            wireframe: currentWireframe,
            scene,
            solidMaterial,
            wireframeMaterial,
            subdivisionSettings,
            displacementTexture,
            updateDimensions: () => updateDimensions(currentMesh),
            applyDisplacement: reapplyDisplacement
        });
        
        if (result) {
            currentMesh = result.mesh;
            currentWireframe = result.wireframe;
            mesh = currentMesh;
            wireframe = currentWireframe;
        }
    },
    toggleWireframe: () => toggleWireframe(currentWireframe),
    downloadSTL: () => downloadSTL(currentMesh),
    centerCamera: () => centerCamera(camera, controls, currentMesh)
});

// Event Listeners
document.getElementById('stlFile').addEventListener('change', (event) => {
    const result = handleSTLUpload({
        event,
        scene,
        mesh: currentMesh,
        wireframe: currentWireframe,
        solidMaterial,
        wireframeMaterial,
        rotation,
        rotationFolder,
        applyDisplacement,
        centerCamera: () => centerCamera(camera, controls, currentMesh),
        currentMesh,
        currentWireframe,
        displacementTexture,
        displacementSettings,
        scaleFactors
    });
    
    if (result && result.onload) {
        result.onload((newMesh, newWireframe) => {
            currentMesh = newMesh;
            currentWireframe = newWireframe;
            mesh = currentMesh;  // Update the global mesh reference
            wireframe = currentWireframe;  // Update the global wireframe reference
        });
    }
});

document.getElementById('imageFile').addEventListener('change', (event) => 
    handleImageUpload(event, (texture) => {
        displacementTexture = texture;
        reapplyDisplacement();
    })
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();