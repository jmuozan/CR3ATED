// File: js/geometry-manager.js
class CR3ATDR_GeometryManager {
    constructor() {
        this.displacementTexture = null;
        this.displacementSettings = {
            scale: 0.1,
            invert: false,
            flipUV: false
        };
    }

    generateUVs(geometry) {
        const position = geometry.attributes.position;
        const box = new THREE.Box3().setFromBufferAttribute(position);
        const size = new THREE.Vector3();
        box.getSize(size);

        const uvs = new Float32Array(position.count * 2);
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
                
                if (this.displacementSettings.flipUV) {
                    uvX = 1 - uvX;
                    uvY = 1 - uvY;
                }
                
                vertexUVs.set(key, { x: uvX, y: uvY });
            }
            
            const uvData = vertexUVs.get(key);
            uvs[i * 2] = uvData.x;
            uvs[i * 2 + 1] = uvData.y;
        }

        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        return geometry;
    }

    setDisplacementTexture(texture) {
        this.displacementTexture = texture;
        this.applyDisplacement();
    }

    updateDisplacementSettings(settings) {
        Object.assign(this.displacementSettings, settings);
        this.applyDisplacement();
    }

    resetGeometry(geometry) {
        if (geometry.originalPositions) {
            const position = geometry.attributes.position;
            position.array.set(geometry.originalPositions);
            position.needsUpdate = true;
            geometry.computeVertexNormals();
            return true;
        }
        return false;
    }

    applyDisplacement(geometry) {
        if (!this.displacementTexture || !geometry) return false;

        // Reset geometry to original state before applying displacement
        this.resetGeometry(geometry);

        const position = geometry.attributes.position;
        const normals = geometry.attributes.normal;
        const uv = geometry.attributes.uv;

        if (!uv) {
            console.warn('Geometry has no UV coordinates for displacement');
            return false;
        }

        // Create canvas to read displacement values
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const img = this.displacementTexture.image;
        
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        
        const imageData = context.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;

        // Create a map to store vertex data
        const vertexMap = new Map();
        
        // First pass: gather all unique vertices and their displacements
        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);
            
            const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
            
            // Get UV coordinates and calculate displacement
            const uvX = Math.floor(uv.getX(i) * (img.width - 1));
            const uvY = Math.floor(uv.getY(i) * (img.height - 1));
            const pixelIndex = (uvY * img.width + uvX) * 4;
            
            // Calculate displacement value (using red channel)
            let displacement = (pixels[pixelIndex] / 255) * this.displacementSettings.scale;
            if (this.displacementSettings.invert) {
                displacement = this.displacementSettings.scale - displacement;
            }

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
                entry.displacement = (entry.displacement * entry.indices.length + displacement) / 
                                   (entry.indices.length + 1);
                entry.normal.add(new THREE.Vector3(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i)
                ));
            }
        }

        // Second pass: apply averaged displacements
        vertexMap.forEach(vertexData => {
            vertexData.normal.normalize();
            
            vertexData.indices.forEach(index => {
                const nx = vertexData.normal.x * vertexData.displacement;
                const ny = vertexData.normal.y * vertexData.displacement;
                const nz = vertexData.normal.z * vertexData.displacement;

                position.setXYZ(
                    index,
                    position.getX(index) + nx,
                    position.getY(index) + ny,
                    position.getZ(index) + nz
                );
            });
        });

        position.needsUpdate = true;
        geometry.computeVertexNormals();
        return true;
    }

    performSubdivision(geometry, settings) {
        if (!geometry) return null;

        try {
            const subdivided = LoopSubdivision.modify(geometry, settings.iterations, {
                split: settings.split,
                preserveEdges: settings.preserveEdges,
                flatOnly: settings.flatOnly
            });

            // Store original positions for displacement
            subdivided.originalPositions = subdivided.attributes.position.array.slice();
            
            // Generate new UVs for subdivided geometry
            this.generateUVs(subdivided);
            
            return subdivided;
        } catch (error) {
            console.error('Subdivision error:', error);
            return null;
        }
    }

    calculateDimensions(geometry) {
        if (!geometry) return null;

        const box = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
        const size = new THREE.Vector3();
        box.getSize(size);

        return {
            width: size.x,
            height: size.y,
            depth: size.z,
            center: box.getCenter(new THREE.Vector3())
        };
    }
}