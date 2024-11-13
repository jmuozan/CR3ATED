// Since THREE is loaded globally via script tag, we don't import it
// The LoopSubdivision is also loaded globally, so we don't import it

export function performSubdivision({
    mesh,
    wireframe,
    scene,
    solidMaterial,
    wireframeMaterial,
    subdivisionSettings,
    displacementTexture,
    updateDimensions,
    applyDisplacement
}) {
    if (!mesh) return;
    
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
        
        // Remove existing meshes
        scene.remove(mesh);
        scene.remove(wireframe);
        
        // Create new meshes with subdivided geometry
        const newMesh = new THREE.Mesh(subdivided, solidMaterial);
        const newWireframe = new THREE.Mesh(subdivided.clone(), wireframeMaterial);
        
        // Restore transformations
        newMesh.scale.copy(currentScale);
        newMesh.rotation.copy(currentRotation);
        newMesh.position.copy(currentPosition);
        newWireframe.scale.copy(currentScale);
        newWireframe.rotation.copy(currentRotation);
        newWireframe.position.copy(currentPosition);
        
        scene.add(newMesh);
        scene.add(newWireframe);
        
        // Reapply displacement if texture exists
        if (displacementTexture) {
            applyDisplacement();
        }
        
        updateDimensions();
        
        return {
            mesh: newMesh,
            wireframe: newWireframe
        };
        
    } catch (error) {
        console.error('Subdivision error:', error);
        return null;
    }
}