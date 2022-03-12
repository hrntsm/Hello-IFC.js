# Hello IFC.js

[web-ifc-three](https://ifcjs.github.io/info/ja/docs/Guide/web-ifc-three/Introduction) のドキュメントをもとに、IFC ビューワーを作成する。

以下の記事が概要を掴むのにわかりやすい。

- https://zenn.dev/masamiki/articles/c9a34119acfd6c

現段階（2022/3/12）での注意点として使う threejs は ver 0.135 を使わないと依存関係が解決されない。

# web-ifc-three を使う場合

こちらは ifc.js 公式のドキュメントを参照  
モデルを表示するだけのものは `SimpleViewer` に参考データがあります。
ドキュメントは以下を使います。

- https://ifcjs.github.io/info/ja/docs/Hello%20world

クリックしてプロパティを取得するものは `AdvanceViewer` に参考データがあります。
ドキュメントは以下を使います。

- https://ifcjs.github.io/info/ja/docs/Guide/web-ifc-three/Tutorials/Picking
- [bvh について](https://qiita.com/omochi64/items/9336f57118ba918f82ec)

# web-ifc-viewer を使う場合

ifc.js ではここまでやってきたことがきれいにラップされた viewer が作られています。  
この内容は `UseWebIfcViewer` にあります。

使用できる機能は web-ifc-three がラップされているので web-ifc-three の api が使えるほか、開発中ですが dxf や gltf の作成などの便利な機能がいくつか含まれています。

- https://ifcjs.github.io/info/ja/docs/Guide/web-ifc-three/api

常に開発されていて公式にドキュメントがないので 2022/03/12 時点で動く以下のコードを参考に上げます。

```js
import { IfcViewerAPI } from "web-ifc-viewer";

// キャンバスの設定
const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({ container });
viewer.axes.setAxes();
viewer.grid.setGrid();

// web-ifc の設定
viewer.IFC.setWasmPath("wasm/");
viewer.IFC.loader.ifcManager.applyWebIfcConfig({
  USE_FAST_BOOLS: true,
  COORDINATE_TO_ORIGIN: true,
});

// IFC ファイルの読み込み
const input = document.getElementById("file-input");
input.addEventListener(
  "change",
  async (changed) => {
    const file = changed.target.files[0];
    const ifcURL = URL.createObjectURL(file);
    viewer.IFC.loadIfcUrl(ifcURL);
  },
  false
);

// クリッピングプレーンを作成する関数の作成
const clippingPlane = document.getElementById("clipping-checkbox");
clippingPlane.addEventListener("change", () => {
  viewer.clipper.active = clippingPlane.checked;
});

// マウスホバーした時に色付けさせる
window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

// ダブルクリック時のイベント設定
window.ondblclick = async () => {
  console.log(viewer.clipper.active);
  if (viewer.clipper.active) {
    viewer.clipper.createPlane();
  } else {
    const result = await viewer.IFC.selector.pickIfcItem(true);
    console.log(result);
    if (!result) return;
    const { modelID, id } = result;
    const props = await viewer.IFC.loader.ifcManager.getItemProperties(
      modelID,
      id,
      true
    );
    console.log(props);
  }
};

// キーを押したときの設定
window.onkeydown = async (event) => {
  if (event.code === "Delete" || event.code === "BackSpace") {
    viewer.clipper.deleteAllPlanes();
    viewer.dimensions.delete();
  } else if (event.code === "Escape") {
    viewer.IFC.selector.unpickIfcItems();
  }
};
```
