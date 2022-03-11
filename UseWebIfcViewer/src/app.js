import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container });
viewer.axes.setAxes();
viewer.grid.setGrid();
viewer.IFC.setWasmPath("wasm/");
viewer.IFC.loader.ifcManager.applyWebIfcConfig({
    USE_FAST_BOOLS: true,
    COORDINATE_TO_ORIGIN: true,
})

const input = document.getElementById("file-input");
input.addEventListener("change",
    async (changed) => {
        const file = changed.target.files[0];
        const ifcURL = URL.createObjectURL(file);
        viewer.IFC.loadIfcUrl(ifcURL);
    },
    false
);

const clippingPlane = document.getElementById("clipping-checkbox")
clippingPlane.addEventListener("change",
    () => { viewer.clipper.active = clippingPlane.checked; }
);

window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

window.ondblclick = async () => {
    console.log(viewer.clipper.active);
    if (viewer.clipper.active) {
        viewer.clipper.createPlane();
    } else {
        const result = await viewer.IFC.selector.pickIfcItem(true);
        console.log(result);
        if (!result) return;
        const { modelID, id } = result;
        const props = await viewer.IFC.loader.ifcManager.getItemProperties(modelID, id, true);
        console.log(props);
    }
}

window.onkeydown = async (event) => {
    if (event.code === "Delete" || event.code === "BackSpace") {
        viewer.clipper.deleteAllPlanes();
        viewer.dimensions.delete();
    } else if (event.code === "Escape") {
        viewer.IFC.selector.unpickIfcItems();
    }
}
