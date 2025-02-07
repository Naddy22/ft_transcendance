export class Paddle {
	constructor(x, y) {
		this.x = x; // Position horizontale (à droite)
		this.y = y; // Position verticale (au centre)
		this.width = 10; // Largeur de la raquette
		this.height = 100; // Hauteur de la raquette
		this.dy = 4; // Vitesse de déplacement vertical
		this.movingUp = false;
		this.movingDown = false;
	}

	// Fonction pour dessiner les raquettes
	draw(ctx) {
		ctx.fillStyle = "white";  // Couleur des raquettes
		ctx.fillRect(this.x, this.y, this.width, this.height);  // Dessine un rectangle
	}

	update(canvasHeight) {
		if (this.movingUp && this.y > 0) {
			this.y -= this.dy;
		}
		if (this.movingDown && this.y + this.height < canvasHeight) {
			this.y += this.dy;
		}
	}
}