import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export class Ball3D {
	mesh: BABYLON.Mesh | null = null;
	dx: number;
	dy: number;
	radius: number;
	centerX: number;
	centerY: number;

	constructor(scene: BABYLON.Scene, radius: number, x: number, y: number) {
		this.radius = radius;
		this.centerX = x;
		this.centerY = y;
		this.dx = Math.random() < 0.5 ? 0.1 : -0.1;
		this.dy = 0;
	
		BABYLON.SceneLoader.ImportMesh("", "/models/wool/", "scene.gltf", scene, (meshes) => {
			this.mesh = meshes[0] as BABYLON.Mesh;
			this.mesh.scaling = new BABYLON.Vector3(50, 50, 50);
			this.mesh.position = new BABYLON.Vector3(x, y, 0);

			meshes.forEach(mesh => {
				if (mesh.material) {
					if (mesh.material instanceof BABYLON.PBRMaterial) {
						const pbrMat = mesh.material as BABYLON.PBRMaterial;
						pbrMat.albedoColor = new BABYLON.Color3(10, 10.75, 30.8);
					} else if (mesh.material instanceof BABYLON.StandardMaterial) {
						const stdMat = mesh.material as BABYLON.StandardMaterial;
						stdMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
					}
				}
			});
		}, null, (scene, message, exception) => {
			console.error("Error charging mesh :", message, exception);
		});
	}

	update(sceneHeight: number, leftPaddle: any, rightPaddle: any): void {
		if (!this.mesh) {
			return;
		}
		this.mesh.position.x += this.dx;
		this.mesh.position.y += this.dy;
		
		// Bounce management at the top and bottom of the playing area
		const halfHeight = sceneHeight / 2;
		if (this.mesh.position.y - this.radius <= -halfHeight || this.mesh.position.y + this.radius >= halfHeight) {
		  this.dy *= -1;
		}
		if (this.dx < 0) {
			const leftPaddleRightEdge = leftPaddle.mesh.position.x + leftPaddle.width / 2;
			if (this.mesh.position.x - this.radius <= leftPaddleRightEdge) {
				const paddleTop = leftPaddle.mesh.position.y + leftPaddle.height / 2;
				const paddleBottom = leftPaddle.mesh.position.y - leftPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					let angle = (this.mesh.position.y - leftPaddle.mesh.position.y) / (leftPaddle.height / 2);
					this.dy = angle * 0.1;
					this.dx *= -1;
					this.mesh.position.x = leftPaddleRightEdge + this.radius;
				}
			}
		}

		if (this.dx > 0) {
			const rightPaddleLeftEdge = rightPaddle.mesh.position.x - rightPaddle.width / 2;
			if (this.mesh.position.x + this.radius >= rightPaddleLeftEdge) {
				const paddleTop = rightPaddle.mesh.position.y + rightPaddle.height / 2;
				const paddleBottom = rightPaddle.mesh.position.y - rightPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					let angle = (this.mesh.position.y - rightPaddle.mesh.position.y) / (rightPaddle.height / 2);
					this.dy = angle * 0.1;
					this.dx *= -1;
					this.mesh.position.x = rightPaddleLeftEdge - this.radius;
				}
			}
		}
		// Progressive acceleration
		const acceleration = 1.00025;
		this.dx *= acceleration;
		this.dy *= acceleration;
	}

	reset(rightServes: boolean) {
		if (!this.mesh) return;
		
		this.mesh.position.x = this.centerX;
		this.mesh.position.y = this.centerY;
		this.dy = 0;
		
		this.dx = rightServes ? -0.1 : 0.1;
	}

	clearMesh():void {
		if (this.mesh) {
			this.mesh.dispose();
			this.mesh = null;
		}
	}
}
