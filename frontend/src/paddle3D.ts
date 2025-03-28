import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Paddle3D {
	mesh: BABYLON.Mesh | null = null;
	width: number;
	height: number;
	depth: number;
	dy: number;
	movingUp: boolean;
	movingDown: boolean;
	initialY: number;
	isAI: boolean;
	targetY: number | null = null;

	constructor(
	scene: BABYLON.Scene,
	x: number,
	y: number, 
	side: string,
	isAI = false
	) {
		this.width = 1;
		this.height = 5;
		this.depth = 1;
		this.dy = 0.2;
		this.movingUp = false;
		this.movingDown = false;
		this.initialY = y;
		this.isAI = isAI;

		BABYLON.SceneLoader.ImportMesh(
			"",
			"/models/paw/",
			"scene.gltf",
			scene,
			(meshes) => {
				this.mesh = meshes[0] as BABYLON.Mesh;
				this.mesh.scaling = new BABYLON.Vector3(10, 10, 5);
				this.mesh.position = new BABYLON.Vector3(x, y, 0);
				if (side === "right") {
					this.mesh.scaling.x *= -1;
				}
				this.mesh.setPivotPoint(new BABYLON.Vector3(0, 0.2, 0));
			}
		  );
	  
	}

	update(sceneHeight: number): void {
		if (!this.mesh) {
			return;
		}
		const halfSceneHeight = sceneHeight / 2;

		if (this.movingUp && (this.mesh.position.y + this.height / 2 < halfSceneHeight)) {
			this.mesh.position.y += this.dy;
			if (this.isAI && this.targetY !== null && this.mesh.position.y >= this.targetY - 0.1) {
				this.mesh.position.y = this.targetY;
				this.movingUp = false;
			}
		}
		if (this.movingDown && (this.mesh.position.y - this.height / 2 > -halfSceneHeight)) {
			this.mesh.position.y -= this.dy;
			if (this.isAI && this.targetY !== null && this.mesh.position.y <= this.targetY + 0.1) {
				this.mesh.position.y = this.targetY;
				this.movingDown = false;
			}
		}
	}

	simulateKeyPress(up: boolean, down: boolean, targetY?: number): void {
		this.movingUp = up;
		this.movingDown = down;
		if (this.isAI) this.targetY = targetY !== undefined ? targetY : null;
	}

	reset(): void {
		if (!this.mesh) {
			return;
		}
		this.mesh.position.y = this.initialY;
	}
}
