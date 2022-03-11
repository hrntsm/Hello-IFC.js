import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from "three";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import {
    IFCLoader
} from "web-ifc-three/IFCLoader";

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

const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath("wasm/")
const input = document.getElementById("file-input");
input.addEventListener(
    "change",
    (event) => {
        const file = event.target.files[0];
        if (!file) { return; }
        var ifcURL = URL.createObjectURL(file);
        ifcLoader.load(
            ifcURL,
            (ifcModel) => scene.add(ifcModel));
    },
    false
);
