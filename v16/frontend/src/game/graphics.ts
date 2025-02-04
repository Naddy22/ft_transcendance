
import * as BABYLON from "babylonjs";

export class Graphics {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);

        const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(canvas, true);

        this.engine.runRenderLoop(() => this.scene.render());
    }
}
