import * as BABYLON from 'babylonjs';

export class Ball3D {
	mesh: BABYLON.Mesh;
	velocity: BABYLON.Vector3;
	radius: number;
	x_centered: number;
	y_centered: number;

	/**
	 * @param scene - La scène BabylonJS dans laquelle créer la balle.
	 * @param initialX - La position initiale en X (comme pour le 2D, mais dans l'espace 3D).
	 * @param initialY - La position initiale en Y.
	 * @param radius - Le rayon de la balle.
	 */
	constructor(scene: BABYLON.Scene, initialX: number, initialY: number, radius: number = 10) {
		this.radius = radius;
		this.x_centered = initialX;
		this.y_centered = initialY;
		
		// Crée une sphère dont le diamètre vaut 2 * radius
		this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: this.radius * 2 }, scene);
		
		// Positionne la balle au centre de l'aire de jeu (sur le plan XY, on fixe Z à 0)
		this.mesh.position = new BABYLON.Vector3(initialX, initialY, 0);
		
		// Définir la vélocité initiale (similaire à dx et dy en 2D)
		const dx = Math.random() < 0.5 ? 4 : -4;
		this.velocity = new BABYLON.Vector3(dx, 0, 0);
	}

	/**
	 * Met à jour la position de la balle et gère les collisions.
	 * @param canvasHeight - La hauteur "virtuelle" de la zone de jeu (pour gérer les rebonds en Y).
	 * @param leftPaddle - L'objet paddle de gauche avec ses propriétés (on supposera qu'il a : mesh, width et height).
	 * @param rightPaddle - L'objet paddle de droite.
	 */
	update(
		canvasHeight: number,
		leftPaddle: { mesh: BABYLON.Mesh; width: number; height: number },
		rightPaddle: { mesh: BABYLON.Mesh; width: number; height: number }
	) {
		// Mise à jour de la position par ajout de la vélocité
		this.mesh.position.addInPlace(this.velocity);

		// Rebondir sur les bords haut et bas
		if (this.mesh.position.y - this.radius <= 0 || this.mesh.position.y + this.radius >= canvasHeight) {
		this.velocity.y *= -1;
		}

		// Collision avec le paddle de gauche
		const leftX = leftPaddle.mesh.position.x;
		const leftY = leftPaddle.mesh.position.y;
		if (
		this.mesh.position.x - this.radius <= leftX + leftPaddle.width &&
		this.mesh.position.y > leftY &&
		this.mesh.position.y < leftY + leftPaddle.height
		) {
		// Repositionne la balle juste après le paddle
		this.mesh.position.x = leftX + leftPaddle.width + this.radius;
		// Inverse la direction horizontale
		this.velocity.x = -this.velocity.x;
		// Calcul d'un angle en fonction du point de contact
		let angle = (this.mesh.position.y - (leftY + leftPaddle.height / 2)) / (leftPaddle.height / 2);
		this.velocity.y = angle * 3;
		}

		// Collision avec le paddle de droite
		const rightX = rightPaddle.mesh.position.x;
		const rightY = rightPaddle.mesh.position.y;
		if (
		this.mesh.position.x + this.radius >= rightX &&
		this.mesh.position.y > rightY &&
		this.mesh.position.y < rightY + rightPaddle.height
		) {
		// Repositionne la balle juste avant le paddle
		this.mesh.position.x = rightX - this.radius;
		this.velocity.x = -this.velocity.x;
		let angle = (this.mesh.position.y - (rightY + rightPaddle.height / 2)) / (rightPaddle.height / 2);
		this.velocity.y = angle * 3;
		}

		// Accélération progressive
		const acceleration = 0.001;
		this.velocity.x += this.velocity.x > 0 ? acceleration : -acceleration;
		this.velocity.y += this.velocity.y > 0 ? acceleration : -acceleration;
	}

	/**
	 * Réinitialise la position et la direction de la balle.
	 * @param rightServes - Si true, la balle repart vers la gauche, sinon vers la droite.
	 */
	reset(rightServes: boolean) {
		this.mesh.position.x = this.x_centered;
		this.mesh.position.y = this.y_centered;
		// Réinitialise le mouvement vertical
		this.velocity.y = 0;
		// La balle repart toujours vers celui qui a marqué
		this.velocity.x = rightServes ? -4 : 4;
	}
}
