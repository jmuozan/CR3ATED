export function handleImageUpload(event, callback) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(url, (texture) => {
            if (callback) {
                callback(texture);
            }
        });
    }
}