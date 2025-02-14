import * as BABYLON from 'babylonjs';

export class Ball3D {
	mesh: BABYLON.Mesh;
	dx: number;
	dy: number;
	radius: number;
	centerX: number;
	centerY: number;

	 /**
   * @param scene La scène BabylonJS.
   * @param x La position X initiale (et centre) de la balle en unités.
   * @param y La position Y initiale (et centre) de la balle en unités.
   * @param radius Le rayon de la balle en unités.
   */
	constructor(scene: BABYLON.Scene, radius: number, x: number, y: number) {
		this.radius = radius;
		this.centerX = x;
		this.centerY = y;

		// Crée une sphère pour la balle
		this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: radius * 2 }, scene);
		// Positionne la balle sur le plan XY (z = 0) (au centre)
		this.mesh.position = new BABYLON.Vector3(x, y, 0);

		// Initialise la vélocité (pour la direction du mouvement)
		this.dx = Math.random() < 0.5 ? 0.1 : -0.1;
		this.dx = 0.1;
		this.dy = 0.1;
	}

	update(sceneHeight: number, leftPaddle: any, rightPaddle: any): void {
		// Met à jour la position en ajoutant la vélocité
		this.mesh.position.x += this.dx;
		this.mesh.position.y += this.dy;
		
		// Gestion du rebond sur le haut et le bas de la zone de jeu
		const halfHeight = sceneHeight / 2;
		if (this.mesh.position.y - this.radius <= -halfHeight -1.5 || this.mesh.position.y + this.radius >= halfHeight + 1.5) {
		  this.dy *= -1;
		}
		
		// Collision avec la raquette gauche (lorsque la balle se déplace vers la gauche)
		if (this.dx < 0) {
			// Calcul du bord droit de la raquette gauche
			const leftPaddleRightEdge = leftPaddle.mesh.position.x + leftPaddle.width / 2;
			if (this.mesh.position.x - this.radius <= leftPaddleRightEdge) {
				// Vérifier si la balle est dans la plage verticale de la raquette
				const paddleTop = leftPaddle.mesh.position.y + leftPaddle.height / 2;
				const paddleBottom = leftPaddle.mesh.position.y - leftPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					// Collision détectée : inverser la direction horizontale
					this.dx *= -1;
					// Ajuster la position pour éviter que la balle ne reste "collée" à la raquette
					this.mesh.position.x = leftPaddleRightEdge + this.radius;
				}
			}
		}

		// Collision avec la raquette droite (lorsque la balle se déplace vers la droite)
		if (this.dx > 0) {
			// Calcul du bord gauche de la raquette droite
			const rightPaddleLeftEdge = rightPaddle.mesh.position.x - rightPaddle.width / 2;
			if (this.mesh.position.x + this.radius >= rightPaddleLeftEdge) {
				const paddleTop = rightPaddle.mesh.position.y + rightPaddle.height / 2;
				const paddleBottom = rightPaddle.mesh.position.y - rightPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					this.dx *= -1;
					this.mesh.position.x = rightPaddleLeftEdge - this.radius;
				}
			}
		}
		
	}

	reset(rightServes: boolean) {
		this.mesh.position.x = this.centerX;
		this.mesh.position.y = this.centerY;
		// Si le joueur de droite a la main, la balle repart vers la gauche (dx négatif)
		this.dx = rightServes ? -0.2 : 0.2;
		this.dy = 0.2;
	}
}

// export class Ball3D {
// 	mesh: BABYLON.Mesh;
// 	velocity: BABYLON.Vector3;
// 	radius: number;
// 	x_centered: number;
// 	y_centered: number;

// 	/**
// 	 * @param scene - La scène BabylonJS dans laquelle créer la balle.
// 	 * @param initialX - La position initiale en X (comme pour le 2D, mais dans l'espace 3D).
// 	 * @param initialY - La position initiale en Y.
// 	 * @param radius - Le rayon de la balle.
// 	 */
// 	constructor(scene: BABYLON.Scene, initialX: number, initialY: number, radius: number = 10) {
// 		this.radius = radius;
// 		this.x_centered = initialX;
// 		this.y_centered = initialY;
		
// 		// Crée une sphère dont le diamètre vaut 2 * radius
// 		this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: this.radius * 2 }, scene);
		
// 		// Positionne la balle au centre de l'aire de jeu (sur le plan XY, on fixe Z à 0)
// 		this.mesh.position = new BABYLON.Vector3(initialX, initialY, 0);
		
// 		// Définir la vélocité initiale (similaire à dx et dy en 2D)
// 		const dx = Math.random() < 0.5 ? 4 : -4;
// 		this.velocity = new BABYLON.Vector3(dx, 0, 0);
// 	}

// 	/**
// 	 * Met à jour la position de la balle et gère les collisions.
// 	 * @param canvasHeight - La hauteur "virtuelle" de la zone de jeu (pour gérer les rebonds en Y).
// 	 * @param leftPaddle - L'objet paddle de gauche avec ses propriétés (on supposera qu'il a : mesh, width et height).
// 	 * @param rightPaddle - L'objet paddle de droite.
// 	 */
// 	update(
// 		canvasHeight: number,
// 		leftPaddle: { mesh: BABYLON.Mesh; width: number; height: number },
// 		rightPaddle: { mesh: BABYLON.Mesh; width: number; height: number }
// 	) {
// 		// Mise à jour de la position par ajout de la vélocité
// 		this.mesh.position.addInPlace(this.velocity);

// 		// Rebondir sur les bords haut et bas
// 		if (this.mesh.position.y - this.radius <= 0 || this.mesh.position.y + this.radius >= canvasHeight) {
// 		this.velocity.y *= -1;
// 		}

// 		// Collision avec le paddle de gauche
// 		const leftX = leftPaddle.mesh.position.x;
// 		const leftY = leftPaddle.mesh.position.y;
// 		if (
// 		this.mesh.position.x - this.radius <= leftX + leftPaddle.width &&
// 		this.mesh.position.y > leftY &&
// 		this.mesh.position.y < leftY + leftPaddle.height
// 		) {
// 		// Repositionne la balle juste après le paddle
// 		this.mesh.position.x = leftX + leftPaddle.width + this.radius;
// 		// Inverse la direction horizontale
// 		this.velocity.x = -this.velocity.x;
// 		// Calcul d'un angle en fonction du point de contact
// 		let angle = (this.mesh.position.y - (leftY + leftPaddle.height / 2)) / (leftPaddle.height / 2);
// 		this.velocity.y = angle * 3;
// 		}

// 		// Collision avec le paddle de droite
// 		const rightX = rightPaddle.mesh.position.x;
// 		const rightY = rightPaddle.mesh.position.y;
// 		if (
// 		this.mesh.position.x + this.radius >= rightX &&
// 		this.mesh.position.y > rightY &&
// 		this.mesh.position.y < rightY + rightPaddle.height
// 		) {
// 		// Repositionne la balle juste avant le paddle
// 		this.mesh.position.x = rightX - this.radius;
// 		this.velocity.x = -this.velocity.x;
// 		let angle = (this.mesh.position.y - (rightY + rightPaddle.height / 2)) / (rightPaddle.height / 2);
// 		this.velocity.y = angle * 3;
// 		}

// 		// Accélération progressive
// 		const acceleration = 0.001;
// 		this.velocity.x += this.velocity.x > 0 ? acceleration : -acceleration;
// 		this.velocity.y += this.velocity.y > 0 ? acceleration : -acceleration;
// 	}

// 	/**
// 	 * Réinitialise la position et la direction de la balle.
// 	 * @param rightServes - Si true, la balle repart vers la gauche, sinon vers la droite.
// 	 */
// 	reset(rightServes: boolean) {
// 		this.mesh.position.x = this.x_centered;
// 		this.mesh.position.y = this.y_centered;
// 		// Réinitialise le mouvement vertical
// 		this.velocity.y = 0;
// 		// La balle repart toujours vers celui qui a marqué
// 		this.velocity.x = rightServes ? -4 : 4;
// 	}
// }
