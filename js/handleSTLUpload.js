export function handleSTLUpload({
    event,
    scene,
    mesh,
    wireframe,
    solidMaterial,
    wireframeMaterial,
    rotation,
    rotationFolder,
    applyScaling,
    applyDisplacement,
    updateDimensions,
    centerCamera,
    currentMesh,
    currentWireframe,
    displacementTexture,
    displacementSettings
}) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        return {
            onload: (callback) => {
                reader.onload = function (e) {
                    const loader = new THREE.STLLoader();
                    const geometry = loader.parse(e.target.result);

                    if (mesh) {
                        scene.remove(mesh);
                        scene.remove(wireframe);
                    }

                    geometry.computeVertexNormals();
                    
                    // Store original positions
                    geometry.originalPositions = geometry.attributes.position.array.slice();

                    const newMesh = new THREE.Mesh(geometry, solidMaterial);
                    const newWireframe = new THREE.Mesh(geometry.clone(), wireframeMaterial);
                    newWireframe.visible = false;

                    // Rotate mesh to make Z vertical
                    newMesh.rotation.x = -Math.PI / 2;
                    newWireframe.rotation.x = -Math.PI / 2;

                    scene.add(newMesh);
                    scene.add(newWireframe);

                    // Reset rotation values in the GUI
                    rotation.rotateX = -90;
                    rotation.rotateY = 0;
                    rotation.rotateZ = 0;

                    // Update GUI controllers
                    for (let i in rotationFolder.__controllers) {
                        rotationFolder.__controllers[i].updateDisplay();
                    }

                    // Call the callback with the new meshes first
                    callback(newMesh, newWireframe);

                    applyScaling();
                    if (applyDisplacement && displacementTexture) {
                        applyDisplacement({
                            currentMesh: newMesh,
                            currentWireframe: newWireframe,
                            displacementTexture,
                            displacementSettings
                        });
                    }
                    updateDimensions();
                    centerCamera();
                };
                reader.readAsArrayBuffer(file);
            }
        };
    }
    return null;
}