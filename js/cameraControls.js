export function centerCamera(camera, controls, currentMesh) {
    if (!currentMesh) return;
    
    // Get the bounding box of the mesh
    const boundingBox = new THREE.Box3().setFromObject(currentMesh);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // Calculate the distance based on the size of the object
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = (maxDim / 2) / Math.tan(fov / 2) * 1.5;
    
    // Set camera position and target
    // Position camera slightly elevated to better show the vertical orientation
    camera.position.set(cameraDistance * 0.5, cameraDistance * 0.5, cameraDistance);
    controls.target.copy(center);
    
    // Update controls and camera
    controls.update();
    camera.updateProjectionMatrix();
}

export function setRotation({ mesh, wireframe, rotation }) {
    if (!mesh || !wireframe) return;
    
    const radiansX = THREE.MathUtils.degToRad(rotation.rotateX);
    const radiansY = THREE.MathUtils.degToRad(rotation.rotateY);
    const radiansZ = THREE.MathUtils.degToRad(rotation.rotateZ);

    mesh.rotation.set(radiansX, radiansY, radiansZ);
    wireframe.rotation.set(radiansX, radiansY, radiansZ);
}