// File: js/gui-manager.js
class CR3ATDR_GuiManager {
    constructor(settings, callbacks) {
        this.gui = new dat.GUI();
        this.setupFolders(settings, callbacks);
        this.setupButtons(callbacks);
    }

    setupFolders(settings, callbacks) {
        this.setupScaleFolder(settings.scale, callbacks.onScale);
        this.setupRotationFolder(settings.rotation, callbacks.onRotation);
        this.setupDisplacementFolder(settings.displacement, callbacks.onDisplacement);
        this.setupSubdivisionFolder(settings.subdivision, callbacks.onSubdivision);
    }

    setupButtons(callbacks) {
        const buttons = {
            'Toggle Wireframe': callbacks.onToggleWireframe,
            'Upload STL': callbacks.onUploadSTL,
            'Upload Image': callbacks.onUploadImage,
            'Download STL': callbacks.onDownloadSTL,
            'Center Camera': callbacks.onCenterCamera
        };

        Object.entries(buttons).forEach(([name, callback]) => {
            const obj = { [name]: callback };
            this.gui.add(obj, name);
        });
    }
}