import * as THREE from 'three';
import { LoopSubdivision } from 'three-subdivide';

/**
 * Performs subdivision on a mesh geometry based on provided settings
 * @param {THREE.Mesh} mesh - The mesh to subdivide
 * @param {THREE.Mesh} wireframe - The wireframe mesh
 * @param {Object} subdivisionSettings - Settings for subdivision
 * @param {number} subdivisionSettings.iterations - Number of subdivision iterations
 * @param {boolean} subdivisionSettings.split - Whether to split faces
 * @param {boolean} subdivisionSettings.preserveEdges - Whether to preserve edges
 * @param {boolean} subdivisionSettings.flatOnly - Whether to use flat subdivision
 * @param {THREE.Texture} displacementTexture - Optional displacement texture
 * @param {Function} applyDisplacement - Function to apply displacement
 * @param {Function} updateDimensions - Function to update dimensions display
 * @returns {Object} The new mesh and wireframe objects
 */
export function performSubdivision(
    mesh, 
    wireframe, 
    subdivisionSettings, 
    displacementTexture, 
    applyDisplacement, 
    updateDimensions
) {
    if (!mesh) return null;
    
    try {
        // Store current states
        const currentScale = mesh.scale.clone();
        const currentRotation = mesh.rotation.clone();
        const currentPosition = mesh.position.clone();
        
        // Get the original geometry
        const geometry = mesh.geometry.clone();
        
        // Perform subdivision
        const subdivided = LoopSubdivision.modify(geometry, subdivisionSettings.iterations, {
            split: subdivisionSettings.split,
            preserveEdges: subdivisionSettings.preserveEdges,
            flatOnly: subdivisionSettings.flatOnly
        });

        // Store original positions for displacement
        subdivided.originalPositions = subdivided.attributes.position.array.slice();
        
        // Create new meshes with subdivided geometry
        const newMesh = new THREE.Mesh(subdivided, mesh.material);
        const newWireframe = new THREE.Mesh(subdivided.clone(), wireframe.material);
        
        // Restore transformations
        newMesh.scale.copy(currentScale);
        newMesh.rotation.copy(currentRotation);
        newMesh.position.copy(currentPosition);
        newWireframe.scale.copy(currentScale);
        newWireframe.rotation.copy(currentRotation);
        newWireframe.position.copy(currentPosition);
        
        // Reapply displacement if texture exists
        if (displacementTexture) {
            applyDisplacement();
        }
        
        updateDimensions();
        
        return { mesh: newMesh, wireframe: newWireframe };
        
    } catch (error) {
        console.error('Subdivision error:', error);
        return null;
    }
}