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

// Initialize the drawing board functionality
function initDrawingBoard() {
    // Create the modal HTML structure
    const modalHTML = `
        <div id="drawingModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="controls">
                    <button id="penTool" class="active">✏️ Pen</button>
                    <div class="control-group">
                        <label>Points Density: </label>
                        <input type="range" id="pointDensity" min="1" max="20" value="5">
                        <span id="densityValue">5px</span>
                    </div>
                    <button id="clearCanvas">Clear</button>
                    <button id="exportSVG">Export SVG</button>
                    <button id="preview3D">3D Preview</button>
                    <button id="exportSTL">Export STL</button>
                </div>
                <div class="canvas-container">
                    <svg id="drawing-area" viewbox="0 0 550 400">
                        <line x1="275" y1="0" x2="275" y2="400" stroke="#666" stroke-width="1" stroke-dasharray="5,5"></line>
                    </svg>
                    <div id="preview-container"></div>
                </div>
            </div>
        </div>
    `;

    // Add the modal to the document if it doesn't exist
    if (!document.getElementById('drawingModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Set up modal controls
    const modal = document.getElementById('drawingModal');
    const closeBtn = modal.querySelector('.close');

    // Close button handler
    closeBtn.onclick = () => {
        modal.style.display = "none";
    };

    // Click outside modal to close
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Import and initialize the drawing script
    import('./draw/script.js')
        .then(() => {
            console.log('Drawing script loaded successfully');
        })
        .catch(error => {
            console.error('Error loading drawing script:', error);
        });
}

// Initialize drawing board when the page loads
initDrawingBoard();

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
    centerCamera: () => centerCamera(camera, controls, currentMesh),
    openDrawingBoard: () => {
        const modal = document.getElementById('drawingModal');
        if (modal) {
            modal.style.display = "block";
        } else {
            console.error('Drawing modal not found');
            initDrawingBoard();
            modal.style.display = "block";
        }
    }
});

// Event Listeners for file uploads
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
            mesh = currentMesh;
            wireframe = currentWireframe;
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