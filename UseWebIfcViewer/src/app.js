import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container });
viewer.addAxes();
viewer.addGrid();

const input = document.getElementById("file-input");
viewer.IFC.setWasmPath("wasm/");
viewer.

input.addEventListener("change",
    async (changed) => {
        const file = changed.target.files[0];
        const ifcURL = URL.createObjectURL(file);
        viewer.IFC.loadIfcUrl(ifcURL);
    },

    false
);