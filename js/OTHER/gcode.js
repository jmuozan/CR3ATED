class GCode {
    constructor() {
        this.settings = {
            nozzleDiameter: 0.4,
            layerHeight: 0.2,
            printSpeed: 60,
            travelSpeed: 120,
            retraction: 5,
            retractionSpeed: 45,
            bedTemp: 60,
            nozzleTemp: 200,
            fanSpeed: 255,
            infillDensity: 20,
            wallThickness: 1.2,
            initialLayerHeight: 0.3,
            initialLayerSpeed: 30,
            zHopHeight: 0.2,
            useZHop: true,
            generateSupports: false,
            supportOverhangAngle: 45,
            skirtLines: 2,
            skirtDistance: 4
        };

        this.currentX = 0;
        this.currentY = 0;
        this.currentZ = 0;
        this.isRetracted = false;
        this.currentExtrusion = 0;
    }

    // Simplified point creation
    createPoint(x, y) {
        return { x: x, y: y };
    }

    // Simplified distance check
    pointsAreClose(p1, p2, tolerance = 0.001) {
        if (!p1 || !p2 || typeof p1.x === 'undefined' || typeof p2.x === 'undefined') {
            return false;
        }
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy) < tolerance;
    }

    sliceMesh(mesh) {
        try {
            const geometry = mesh.geometry;
            const position = geometry.attributes.position;
            const indices = geometry.index ? geometry.index.array : null;
            
            // Get the complete world matrix including all transformations
            mesh.updateMatrixWorld(true);
            const worldMatrix = mesh.matrixWorld.clone();
            
            // Get transformed bounding box
            const bbox = new THREE.Box3().setFromObject(mesh);
            
            // Use the actual transformed min/max Z for layers
            const minZ = bbox.min.y; // Using Y as Z since the mesh is rotated 90 degrees
            const maxZ = bbox.max.y;
            
            console.log('Bounding box:', {
                min: bbox.min,
                max: bbox.max,
                layerRange: maxZ - minZ
            });
            
            const totalLayers = Math.ceil((maxZ - minZ) / this.settings.layerHeight);
            const layers = [];

            for (let layer = 0; layer < totalLayers; layer++) {
                const z = minZ + (layer * this.settings.layerHeight);
                const intersections = [];
                
                const vertCount = indices ? indices.length : position.count;
                for (let i = 0; i < vertCount; i += 3) {
                    const v1 = new THREE.Vector3();
                    const v2 = new THREE.Vector3();
                    const v3 = new THREE.Vector3();
                    
                    for (let j = 0; j < 3; j++) {
                        const idx = indices ? indices[i + j] : i + j;
                        const vertex = j === 0 ? v1 : (j === 1 ? v2 : v3);
                        vertex.set(
                            position.getX(idx),
                            position.getY(idx),
                            position.getZ(idx)
                        );
                        // Apply world matrix to get actual position including rotation
                        vertex.applyMatrix4(worldMatrix);
                    }
                    
                    // Since the mesh is rotated 90 degrees, we slice along Y axis
                    const intersection = this.getTriangleIntersection([v1, v2, v3], z, true);
                    if (intersection) {
                        intersections.push(intersection);
                    }
                }
                
                if (intersections.length > 0) {
                    const contours = this.buildContours(intersections);
                    if (contours.length > 0) {
                        layers.push({
                            z: z,
                            contours: contours
                        });
                    }
                }
            }
            
            console.log(`Generated ${layers.length} layers`);
            return layers;
        } catch (error) {
            console.error('Error in sliceMesh:', error);
            return [];
        }
    }

    getTriangleIntersection(vertices, z, useYAsZ = true) {
        // Map coordinates based on rotation
        const getZ = (v) => useYAsZ ? v.y : v.z;
        const getPoint = (x, y, z) => useYAsZ ? this.createPoint(x, z) : this.createPoint(x, y);
        
        const [v1, v2, v3] = vertices;
        
        // Check if triangle intersects with z plane using Y as Z
        const above = vertices.filter(v => getZ(v) > z);
        const below = vertices.filter(v => getZ(v) < z);
        
        if (above.length === 0 || below.length === 0) {
            return null;
        }
        
        const points = [];
        const edges = [[0,1], [1,2], [2,0]];
        
        for (const [i, j] of edges) {
            const start = vertices[i];
            const end = vertices[j];
            
            if ((getZ(start) >= z && getZ(end) <= z) || (getZ(start) <= z && getZ(end) >= z)) {
                const t = (z - getZ(start)) / (getZ(end) - getZ(start));
                const x = start.x + t * (end.x - start.x);
                const intersectZ = start.z + t * (end.z - start.z);
                points.push(getPoint(x, 0, intersectZ));
            }
        }
        
        return points.length === 2 ? points : null;
    }

    generatePrintMove(x, y, z, extrusion = null) {
        const dx = x - this.currentX;
        const dy = y - this.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (extrusion === null) {
            extrusion = this.calculateExtrusion(distance);
        }
        
        // Swap Y and Z coordinates since the model is rotated 90 degrees
        const gcode = `G1 X${x.toFixed(3)} Y${z.toFixed(3)} Z${y.toFixed(3)} E${extrusion} F${this.settings.printSpeed * 60}\n`;
        
        this.currentX = x;
        this.currentY = y;
        this.currentZ = z;
        this.currentExtrusion += parseFloat(extrusion);
        
        return gcode;
    }

    generateTravel(x, y, z) {
        let gcode = '';
        if (this.settings.useZHop) {
            gcode += this.retract();
            gcode += `G1 Z${y.toFixed(3)} F3000\n`; // Y becomes Z due to rotation
        }
        // Swap Y and Z coordinates
        gcode += `G1 X${x.toFixed(3)} Y${z.toFixed(3)} F${this.settings.travelSpeed * 60}\n`;
        if (this.settings.useZHop) {
            gcode += `G1 Z${y.toFixed(3)} F3000\n`; // Y becomes Z due to rotation
            gcode += this.unretract();
        }
        this.currentX = x;
        this.currentY = y;
        this.currentZ = z;
        return gcode;
    }

    buildContours(intersections) {
        const contours = [];
        const used = new Set();
        
        for (let startIdx = 0; startIdx < intersections.length; startIdx++) {
            if (used.has(startIdx)) continue;
            
            const contour = [];
            let currentIdx = startIdx;
            let currentSegment = intersections[currentIdx];
            
            if (!currentSegment || currentSegment.length !== 2) continue;
            
            used.add(currentIdx);
            contour.push(this.createPoint(currentSegment[0].x, currentSegment[0].y));
            
            let currentPoint = this.createPoint(currentSegment[1].x, currentSegment[1].y);
            let foundNext = true;
            
            while (foundNext && contour.length < intersections.length * 2) {
                contour.push(currentPoint);
                foundNext = false;
                
                for (let i = 0; i < intersections.length; i++) {
                    if (used.has(i)) continue;
                    
                    const segment = intersections[i];
                    if (!segment || segment.length !== 2) continue;
                    
                    const start = segment[0];
                    const end = segment[1];
                    
                    if (this.pointsAreClose(currentPoint, start)) {
                        currentPoint = this.createPoint(end.x, end.y);
                        used.add(i);
                        foundNext = true;
                        break;
                    }
                    
                    if (this.pointsAreClose(currentPoint, end)) {
                        currentPoint = this.createPoint(start.x, start.y);
                        used.add(i);
                        foundNext = true;
                        break;
                    }
                }
                
                if (this.pointsAreClose(currentPoint, contour[0])) {
                    break;
                }
            }
            
            if (contour.length > 2) {
                contours.push(contour);
            }
        }
        
        return contours;
    }

    generateFromMesh(mesh) {
        let gcode = this.generateHeader();
        
        const layers = this.sliceMesh(mesh);
        console.log(`Generated ${layers.length} layers`);
        
        // Generate skirt
        const bbox = new THREE.Box3().setFromObject(mesh);
        gcode += '; Skirt\n';
        gcode += this.generateSkirt(bbox);
        
        // Process each layer
        layers.forEach((layer, layerIndex) => {
            gcode += `\n; Layer ${layerIndex}\n`;
            
            layer.contours.forEach((contour, contourIndex) => {
                gcode += `; Contour ${contourIndex}\n`;
                
                // Move to start point
                const startPoint = contour[0];
                gcode += this.generateTravel(startPoint.x, startPoint.y, layer.z);
                gcode += this.unretract();
                
                // Print contour
                for (let i = 1; i < contour.length; i++) {
                    const point = contour[i];
                    gcode += this.generatePrintMove(point.x, point.y, layer.z);
                }
                
                // Close contour
                gcode += this.generatePrintMove(startPoint.x, startPoint.y, layer.z);
            });
        });
        
        gcode += this.generateFooter();
        return gcode;
    }

    generateHeader() {
        return `; Generated by CR3ATDR GCode Generator
M140 S${this.settings.bedTemp} ; Set bed temperature
M105 ; Report temperatures
M190 S${this.settings.bedTemp} ; Wait for bed temperature
M104 S${this.settings.nozzleTemp} ; Set nozzle temperature
M105 ; Report temperatures
M109 S${this.settings.nozzleTemp} ; Wait for nozzle temperature
M82 ; Absolute extrusion mode
G90 ; Absolute positioning
M83 ; Relative extrusion
G28 ; Home all axes
G1 Z5 F3000 ; Lift Z
G21 ; Set units to millimeters
G92 E0 ; Reset extrusion distance
M107 ; Fan off
`;
    }

    generateFooter() {
        return `; End GCode
G91 ; Relative positioning
G1 E-2 F2700 ; Retract a bit
G1 E-2 Z0.2 F2400 ; Retract and raise Z
G1 X5 Y5 F3000 ; Wipe out
G1 Z10 ; Raise Z more
G90 ; Absolute positioning
G1 X0 Y220 ; Present print
M106 S0 ; Turn-off fan
M104 S0 ; Turn-off hotend
M140 S0 ; Turn-off bed
M84 X Y E ; Disable all steppers but Z
`;
    }

    retract() {
        if (!this.isRetracted) {
            this.isRetracted = true;
            return `G1 E-${this.settings.retraction} F${this.settings.retractionSpeed * 60}\n`;
        }
        return '';
    }

    unretract() {
        if (this.isRetracted) {
            this.isRetracted = false;
            return `G1 E${this.settings.retraction} F${this.settings.retractionSpeed * 60}\n`;
        }
        return '';
    }

    generateTravel(x, y, z) {
        let gcode = '';
        if (this.settings.useZHop) {
            gcode += this.retract();
            gcode += `G1 Z${(z + this.settings.zHopHeight).toFixed(3)} F3000\n`;
        }
        gcode += `G1 X${x.toFixed(3)} Y${y.toFixed(3)} F${this.settings.travelSpeed * 60}\n`;
        if (this.settings.useZHop) {
            gcode += `G1 Z${z.toFixed(3)} F3000\n`;
            gcode += this.unretract();
        }
        this.currentX = x;
        this.currentY = y;
        this.currentZ = z;
        return gcode;
    }

    generatePrintMove(x, y, z, extrusion = null) {
        const dx = x - this.currentX;
        const dy = y - this.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (extrusion === null) {
            extrusion = this.calculateExtrusion(distance);
        }
        
        const gcode = `G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} E${extrusion} F${this.settings.printSpeed * 60}\n`;
        
        this.currentX = x;
        this.currentY = y;
        this.currentZ = z;
        this.currentExtrusion += parseFloat(extrusion);
        
        return gcode;
    }

    calculateExtrusion(distance, layerHeight = this.settings.layerHeight, lineWidth = this.settings.nozzleDiameter) {
        const area = layerHeight * lineWidth;
        const volume = distance * area;
        return (volume / (Math.PI * (1.75/2) ** 2)).toFixed(4);
    }

    generateSkirt(boundingBox) {
        let gcode = '';
        const offset = this.settings.skirtDistance;
        
        for (let i = 0; i < this.settings.skirtLines; i++) {
            const currentOffset = offset + (i * this.settings.nozzleDiameter);
            const points = [
                [boundingBox.min.x - currentOffset, boundingBox.min.y - currentOffset],
                [boundingBox.max.x + currentOffset, boundingBox.min.y - currentOffset],
                [boundingBox.max.x + currentOffset, boundingBox.max.y + currentOffset],
                [boundingBox.min.x - currentOffset, boundingBox.max.y + currentOffset]
            ];
            
            gcode += this.generateTravel(points[0][0], points[0][1], this.settings.initialLayerHeight);
            gcode += this.unretract();
            
            for (let j = 0; j < points.length; j++) {
                const [x, y] = points[j];
                gcode += this.generatePrintMove(x, y, this.settings.initialLayerHeight);
            }
            
            gcode += this.generatePrintMove(points[0][0], points[0][1], this.settings.initialLayerHeight);
        }
        
        return gcode;
    }
    saveToFile(gcode, filename = 'print.gcode') {
        const blob = new Blob([gcode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    generateGCodeAndSave(meshObject) {
        if (!meshObject) {
            console.error('No mesh provided to GCode generator');
            alert('Please load an STL file first');
            return;
        }

        try {
            console.log('Starting GCode generation...');
            console.log('Mesh geometry:', meshObject.geometry);
            const gcode = this.generateFromMesh(meshObject);
            console.log('GCode generated successfully, saving file...');
            this.saveToFile(gcode);
        } catch (error) {
            console.error('Error generating GCode:', error);
            alert('Error generating GCode. Check console for details.');
        }
    }
}

window.GCode = GCode;