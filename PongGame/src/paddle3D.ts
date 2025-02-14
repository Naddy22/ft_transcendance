import * as BABYLON from 'babylonjs';

export class Paddle3D {
	mesh: BABYLON.Mesh;
	width: number;
	height: number;
	dy: number;
	movingUp: boolean;
	movingDown: boolean;

	/**
	 * @param scene - La scène BabylonJS dans laquelle créer le paddle.
	 * @param x - La position horizontale initiale.
	 * @param y - La position verticale initiale (on passera la position centrée).
	 */
	constructor(scene: BABYLON.Scene, x: number, y: number) {
		// On garde les mêmes valeurs pour width et height que ta version 2D
		this.width = 10; 
		this.height = 100;
		this.dy = 4; // Vitesse de déplacement
		this.movingUp = false;
		this.movingDown = false;

		// Crée un mesh de type boîte pour représenter le paddle.
		// On fixe une profondeur arbitraire (ici 10) pour donner du volume en 3D.
		this.mesh = BABYLON.MeshBuilder.CreateBox("paddle", { width: this.width, height: this.height, depth: 10 }, scene);

		// Position initiale : en 2D, tu faisais "this.y = y - 50" pour centrer verticalement.
		// Ici, on positionne le mesh de sorte que son centre soit à (x, y - height/2, 0)
		// Cela permet de garder le même positionnement "visuel" que ta version 2D.
		this.mesh.position = new BABYLON.Vector3(x, y - this.height / 2, 0);
	}

	/**
	 * Met à jour la position verticale du paddle en fonction des flags movingUp et movingDown.
	 * @param canvasHeight - La hauteur de la zone de jeu (pour limiter le déplacement).
	 */
	update(canvasHeight: number): void {
		// On vérifie que le paddle ne dépasse pas le haut ou le bas de la zone de jeu.
		if (this.movingUp && this.mesh.position.y + this.height / 2 < canvasHeight) {
		this.mesh.position.y += this.dy;
		}
		if (this.movingDown && this.mesh.position.y - this.height / 2 > 0) {
		this.mesh.position.y -= this.dy;
		}
	}

	/**
	 * Réinitialise la position verticale du paddle.
	 * @param canvasHeight - La hauteur de la zone de jeu.
	 */
	reset(canvasHeight: number): void {
		// Remet le paddle au centre verticalement
		this.mesh.position.y = canvasHeight / 2;
	}
}
