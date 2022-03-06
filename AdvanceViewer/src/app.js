import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Raycaster,
    Vector2,
    MeshLambertMaterial
} from "three";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
import {
    IFCLoader
} from "web-ifc-three";
import {
    acceleratedRaycast,
    computeBoundsTree,
    disposeBoundsTree
} from 'three-mesh-bvh';

// Three.jsのシーンを作成します。
const scene = new Scene();

// ビューポートのサイズを格納するオブジェクト
const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// カメラ（ユーザーの視点）の作成
const aspect = size.width / size.height;
const camera = new PerspectiveCamera(75, aspect);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

// シーンの照明を作成する
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-5, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

// レンダラを設定し、HTMLのキャンバスをフェッチします。
const threeCanvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({
    canvas: threeCanvas,
    alpha: true
});

renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// シーンにグリッドと軸を作成する
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

// オービットコントロール（シーンをナビゲートするためのもの）の作成
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

// アニメーションループ
const animate = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();

// ビューポートをブラウザのサイズに合わせる
window.addEventListener("resize", () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
});

const ifcModels = [];
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath("wasm/")
// ifcLoader.ifcManager.setupThreeMeshBVH(
//     acceleratedRaycast,
//     computeBoundsTree,
//     disposeBoundsTree
// );


const input = document.getElementById("file-input");
input.addEventListener(
    "change",
    (event) => {
        const file = event.target.files[0];
        if (!file) { return; }
        var ifcURL = URL.createObjectURL(file);
        ifcLoader.load(
            ifcURL,
            (ifcModel) => {
                scene.add(ifcModel);
                ifcModels.push(ifcModel);
            },
        );
    },
    false
);

const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function cast(event) {

    // スクリーン上のマウスの位置を計算する
    const bounds = threeCanvas.getBoundingClientRect();

    const x1 = event.clientX - bounds.left;
    const x2 = bounds.right - bounds.left;
    mouse.x = (x1 / x2) * 2 - 1;

    const y1 = event.clientY - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = -(y1 / y2) * 2 + 1;

    // マウスを指し示すカメラの上に置く
    raycaster.setFromCamera(mouse, camera);

    // 光線を当てる
    return raycaster.intersectObjects(ifcModels);
}

async function pick(event) {
    const found = cast(event)[0];
    if (found) {
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const ifc = ifcLoader.ifcManager;
        const id = ifc.getExpressId(geometry, index);
        console.log(id);
        const modelID = found.object.modelID;
        const props = await ifc.getItemProperties(modelID, id, true);
        console.log(props);
    }
}

threeCanvas.ondblclick = pick;

// サブセット素材の作成
const preselectMat = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff88ff,
    depthTest: false
})

const ifc = ifcLoader.ifcManager;

// 前のセレクションへの参照
let preselectModel = { id: - 1 };

function highlight(event, material, model) {
    const found = cast(event)[0];
    if (found) {

        // モデルIDの取得
        model.id = found.object.modelID;

        // Express IDを取得する
        const index = found.faceIndex;
        const geometry = found.object.geometry;
        const id = ifc.getExpressId(geometry, index);

        // サブセットの作成
        ifcLoader.ifcManager.createSubset({
            modelID: model.id,
            ids: [id],
            material: material,
            scene: scene,
            removePrevious: true
        })
    } else {
        // Removes previous highlight
        ifc.removeSubset(model.id, material);
    }
}

window.onmousemove = (event) => highlight(
    event,
    preselectMat,
    preselectModel
);

const selectMat = new MeshLambertMaterial({
    transparent: true,
    opacity: 0.6,
    color: 0xff00ff,
    depthTest: false
})

const selectModel = { id: - 1 };
window.ondblclick = (event) => highlight(
    event,
    selectMat,
    selectModel
);