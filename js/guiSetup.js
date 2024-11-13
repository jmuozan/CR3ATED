export function initializeGUI({
    scaleFactors,
    displacementSettings,
    rotation,
    subdivisionSettings,
    onScaleChange,
    onDisplacementChange,
    onRotationChange,
    onSubdivisionChange,
    toggleWireframe,
    downloadSTL,
    centerCamera
}) {
    const gui = new dat.GUI();

    // Scale Folder
    const scaleFolder = gui.addFolder('Scale');
    scaleFolder.add(scaleFactors, 'scaleX', 0.1, 10).step(0.01).onChange(onScaleChange);
    scaleFolder.add(scaleFactors, 'scaleY', 0.1, 10).step(0.01).onChange(onScaleChange);
    scaleFolder.add(scaleFactors, 'scaleZ', 0.1, 10).step(0.01).onChange(onScaleChange);

    // Displacement Folder
    const displacementFolder = gui.addFolder('Displacement');
    displacementFolder.add(displacementSettings, 'displacementScale', 0, 1, 0.01)
        .onChange(onDisplacementChange);
    displacementFolder.add(displacementSettings, 'invertDisplacement')
        .onChange(onDisplacementChange);
    displacementFolder.add(displacementSettings, 'flipUV')
        .name('Flip UV')
        .onChange(onDisplacementChange);

    // Rotation Folder
    const rotationFolder = gui.addFolder('Rotation');
    rotationFolder.add(rotation, 'rotateX', -180, 180, 30).onChange(onRotationChange);
    rotationFolder.add(rotation, 'rotateY', -180, 180, 30).onChange(onRotationChange);
    rotationFolder.add(rotation, 'rotateZ', -180, 180, 30).onChange(onRotationChange);

    // Subdivision Folder
    const subdivisionFolder = gui.addFolder('Subdivision');
    subdivisionFolder.add(subdivisionSettings, 'iterations', 1, 6, 1);
    subdivisionFolder.add(subdivisionSettings, 'split').name('Split Faces');
    subdivisionFolder.add(subdivisionSettings, 'preserveEdges').name('Preserve Edges');
    subdivisionFolder.add(subdivisionSettings, 'flatOnly').name('Flat Subdivision');
    
    // Make sure subdivide is a function
    subdivisionSettings.subdivide = onSubdivisionChange;
    subdivisionFolder.add(subdivisionSettings, 'subdivide').name('Apply Subdivision');

    // Action Buttons
    const actions = {
        'Toggle Wireframe': toggleWireframe,
        'Upload STL': () => document.getElementById('stlFile').click(),
        'Upload Image': () => document.getElementById('imageFile').click(),
        'Download STL': downloadSTL,
        'Center Camera': centerCamera
    };

    // Add buttons to GUI
    for (const [name, action] of Object.entries(actions)) {
        gui.add(actions, name);
    }

    // Open folders by default
    scaleFolder.open();
    displacementFolder.open();
    rotationFolder.open();
    subdivisionFolder.open();

    return { gui, rotationFolder };
}