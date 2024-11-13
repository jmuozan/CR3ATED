export function applyScaling({
    currentMesh,
    currentWireframe,
    scaleFactors,
    updateDimensions
}) {
    if (currentMesh) {
        currentMesh.scale.set(scaleFactors.scaleX, scaleFactors.scaleY, scaleFactors.scaleZ);
        currentWireframe.scale.set(scaleFactors.scaleX, scaleFactors.scaleY, scaleFactors.scaleZ);
        updateDimensions();
    }
}

export function updateDimensions(currentMesh) {
    if (currentMesh) {
        const box = new THREE.Box3().setFromObject(currentMesh);
        const size = new THREE.Vector3();
        box.getSize(size);
        document.getElementById('sizeX').innerText = `Width: ${size.x.toFixed(2)} units`;
        document.getElementById('sizeY').innerText = `Height: ${size.y.toFixed(2)} units`;
        document.getElementById('sizeZ').innerText = `Depth: ${size.z.toFixed(2)} units`;
    }
}