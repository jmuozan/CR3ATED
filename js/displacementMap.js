export function resetGeometry(geometry) {
    if (geometry.originalPositions) {
        const position = geometry.attributes.position;
        position.array.set(geometry.originalPositions);
        position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
}

export function generateUVs(geometry, displacementSettings) {
    const position = geometry.attributes.position;
    const box = new THREE.Box3().setFromBufferAttribute(position);
    const size = new THREE.Vector3();
    box.getSize(size);

    const uv = new THREE.BufferAttribute(new Float32Array(position.count * 2), 2);
    const vertexUVs = new Map();
    const positionArray = position.array;

    for (let i = 0; i < position.count; i++) {
        const x = positionArray[i * 3];
        const y = positionArray[i * 3 + 1];
        const z = positionArray[i * 3 + 2];
        
        const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
        
        if (!vertexUVs.has(key)) {
            let uvX = (x - box.min.x) / size.x;
            let uvY = (z - box.min.z) / size.z;
            
            if (displacementSettings.flipUV) {
                uvX = 1 - uvX;
                uvY = 1 - uvY;
            }
            
            vertexUVs.set(key, { x: uvX, y: uvY });
        }
        
        const uvData = vertexUVs.get(key);
        uv.setXY(i, uvData.x, uvData.y);
    }

    geometry.setAttribute('uv', uv);
    return uv;
}

export function applyDisplacementMap(geometry, texture, scale, displacementSettings) {
    if (!texture || !geometry) return geometry;
    
    geometry.computeVertexNormals();

    const position = geometry.attributes.position;
    const normals = geometry.attributes.normal;
    const uv = generateUVs(geometry, displacementSettings);
    const dispMap = texture.image;

    if (!dispMap) return geometry;

    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = dispMap.width;
    canvas.height = dispMap.height;
    const context = canvas.getContext('2d');
    context.drawImage(dispMap, 0, 0);
    const imageData = context.getImageData(0, 0, dispMap.width, dispMap.height);
    const data = imageData.data;

    // Create a map to store vertex data using a more precise key
    const vertexMap = new Map();
    const positionArray = position.array;
    
    // First pass: gather all unique vertices and their displacements
    for (let i = 0; i < position.count; i++) {
        const x = positionArray[i * 3];
        const y = positionArray[i * 3 + 1];
        const z = positionArray[i * 3 + 2];
        
        // Create a unique key for this vertex position
        const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
        
        // Get UV coordinates and calculate displacement
        const ux = Math.floor(uv.getX(i) * dispMap.width);
        const uy = Math.floor(uv.getY(i) * dispMap.height);
        const pixelIndex = (uy * dispMap.width + ux) * 4;
        const displacement = (data[pixelIndex] / 255) * scale;
        
        if (!vertexMap.has(key)) {
            vertexMap.set(key, {
                indices: [i],
                displacement: displacement,
                normal: new THREE.Vector3(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                )
            });
        } else {
            const entry = vertexMap.get(key);
            entry.indices.push(i);
            entry.displacement = (entry.displacement * entry.indices.length + displacement) / (entry.indices.length + 1);
            entry.normal.add(new THREE.Vector3(
                normals.getX(i),
                normals.getY(i),
                normals.getZ(i)
            ));
        }
    }

    // Second pass: apply averaged displacements to all vertices
    vertexMap.forEach(vertexData => {
        // Normalize the accumulated normal vector
        vertexData.normal.normalize();
        
        // Apply the same displacement to all instances of this vertex
        vertexData.indices.forEach(index => {
            position.setXYZ(
                index,
                positionArray[index * 3] + vertexData.normal.x * vertexData.displacement,
                positionArray[index * 3 + 1] + vertexData.normal.y * vertexData.displacement,
                positionArray[index * 3 + 2] + vertexData.normal.z * vertexData.displacement
            );
        });
    });

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
}

export function applyDisplacement({
    currentMesh,
    currentWireframe,
    displacementTexture,
    displacementSettings
}) {
    if (displacementTexture && currentMesh) {
        const scale = displacementSettings.displacementScale * 
            (displacementSettings.invertDisplacement ? -1 : 1);
            
        resetGeometry(currentMesh.geometry);
        resetGeometry(currentWireframe.geometry);
        
        applyDisplacementMap(currentMesh.geometry, displacementTexture, scale, displacementSettings);
        applyDisplacementMap(currentWireframe.geometry, displacementTexture, scale, displacementSettings);
    }
}