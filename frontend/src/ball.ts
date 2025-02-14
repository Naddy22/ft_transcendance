// Position initiale de la balle
export class Ball {
	x: number;
	y: number;
	x_centered: number;
	y_centered: number;
	radius: number;
	dx: number;
	dy: number;

	constructor(canvasWidth: number, canvasHeight: number) {
		this.x = canvasWidth / 2; // Position horizontale (au centre)
		this.y = canvasHeight / 2; // Position verticale (au centre)
		this.x_centered = canvasWidth / 2; //gardes en memoire position centré
		this.y_centered = canvasHeight / 2;
		this.radius = 10; // Taille de la balle
		this.dx = Math.random() < 0.5 ? 4 : -4; // Random direction (gauche ou droite)
		this.dy = 0; // Random direction (haut ou bas)
	}

	update(canvasHeight: number, leftPaddle: { x: number; y: number; width: number; height: number }, rightPaddle: { x: number; y: number; width: number; height: number }) {
		this.x += this.dx;
		this.y += this.dy;

		// Rebondir sur le bord du haut et du bas
		if (this.y - this.radius <= 0 || this.y + this.radius >= canvasHeight) {
			this.dy *= -1;
		}

		// Si la balle touche un paddle
		if (this.x - this.radius <= leftPaddle.x + leftPaddle.width && this.y > leftPaddle.y && this.y < leftPaddle.y + leftPaddle.height) {
			// Si la balle a traversé la raquette (derrière la raquette), on la repositionne
			this.x = leftPaddle.x + leftPaddle.width + this.radius;  // Repositionne la balle juste après la raquette
			this.dx = -this.dx;  // Inverse la direction horizontale
			// Déterminer l'angle en fonction de l'endroit où elle touche la raquette
			let angle = (this.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
			this.dy = angle * 3;  // Modifier la direction verticale en fonction de l'angle
		}

		if (this.x + this.radius >= rightPaddle.x && this.y > rightPaddle.y && this.y < rightPaddle.y + rightPaddle.height) {
			// Si la balle a traversé la raquette (derrière la raquette), on la repositionne
			this.x = rightPaddle.x - this.radius;  // Repositionne la balle juste avant la raquette
			this.dx = -this.dx;  // Inverse la direction horizontale
	
			// Déterminer l'angle en fonction de l'endroit où elle touche la raquette
			let angle = (this.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
			this.dy = angle * 3;  // Modifier la direction verticale en fonction de l'angle
		}

		// Ajouter une accélération progressive
		const acceleration = 0.001;  // Valeur d'accélération
		this.dx += (this.dx > 0 ? acceleration : -acceleration);  // Accélérer horizontalement
		this.dy += (this.dy > 0 ? acceleration : -acceleration);  // Accélérer verticalement
	}

	// Fonction pour dessiner la balle
	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'white'; // Couleur blanche
		ctx.beginPath(); // Commencer un dessin
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Dessiner un cercle
		ctx.fill(); // Remplir la balle
	}

	reset(rightServes: boolean) {
		this.x = this.x_centered;
		this.y = this.y_centered;
		this.dy = 0;  // Réinitialiser le mouvement vertical à 0

		// La balle repart toujours vers celui qui a marqué
		this.dx = rightServes ? -4 : 4;
	}
}