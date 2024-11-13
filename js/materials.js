export function createMaterials() {
    const solidMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff });
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000, 
        wireframe: true 
    });

    return { solidMaterial, wireframeMaterial };
}

export function toggleWireframe(wireframe) {
    if (wireframe) {
        wireframe.visible = !wireframe.visible;
    }
}