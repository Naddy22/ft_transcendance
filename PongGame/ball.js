// Position initiale de la balle
export class Ball {
	constructor(canvasWidth, canvasHeight) {
		this.x = canvasWidth / 2; // Position horizontale (au centre)
		this.y = canvasHeight / 2; // Position verticale (au centre)
		this.x_centered = canvasWidth / 2; //gardes en memoire position centré
		this.y_centered = canvasHeight / 2;
		this.radius = 10; // Taille de la balle
		this.dx = Math.random() < 0.5 ? 3 : -3; // Random direction (gauche ou droite)
		this.dy = 0; // Random direction (haut ou bas)
	}

	update(canvasHeight, leftPaddle, rightPaddle) {
		this.x += this.dx;
		this.y += this.dy;

		// Rebondir sur le bord du haut et du bas
		if (this.y - this.radius <= 0 || this.y + this.radius >= canvasHeight) {
			this.dy *= -1;
		}

		// Si la balle touche un paddle
		if (this.x - this.radius <= leftPaddle.x + leftPaddle.width && this.y > leftPaddle.y && this.y < leftPaddle.y + leftPaddle.height) {
		this.dx = -this.dx; // Inverse la direction horizontale
		let angle = (this.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2); // Déterminer l'angle selon l'endroit où elle touche
		this.dy = angle * 3; // Modifier la direction verticale en fonction de l'angle
		}

		if (this.x + this.radius >= rightPaddle.x && this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
			this.dx = -this.dx; // Inverse la direction horizontale
			let angle = (this.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2); // Même logique pour l'autre paddle
			this.dy = angle * 3;
		}
	}

	// Fonction pour dessiner la balle
	draw(ctx) {
		ctx.fillStyle = 'white'; // Couleur blanche
		ctx.beginPath(); // Commencer un dessin
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Dessiner un cercle
		ctx.fill(); // Remplir la balle
	}

	reset(rightServes) {
		this.x = this.x_centered;
		this.y = this.y_centered;
		this.dy = 0;  // Réinitialiser le mouvement vertical à 0

		// La balle repart toujours vers celui qui a marqué
		this.dx = rightServes ? -3 : 3;
	}
}