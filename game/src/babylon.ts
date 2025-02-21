/**
 * Babylon.js
 */

import * as BABYLON from 'babylonjs';
// import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder } from "babylonjs";

export function start3DGame(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener("resize", () => {
        engine.resize();
    });
}
