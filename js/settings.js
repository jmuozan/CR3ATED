export function createDefaultSettings() {
    const scaleFactors = {
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1
    };

    const displacementSettings = {
        displacementScale: 0.1,
        invertDisplacement: false,
        flipUV: false
    };

    const rotation = {
        rotateX: -90,
        rotateY: 0,
        rotateZ: 0
    };

    const subdivisionSettings = {
        iterations: 1,
        split: false,
        preserveEdges: true,
        flatOnly: false
    };

    return {
        scaleFactors,
        displacementSettings,
        rotation,
        subdivisionSettings
    };
}