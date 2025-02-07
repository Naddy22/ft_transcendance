export class Player {
	constructor(name) {
		this.name = name;
		this.score = 0;
	}
	drawScore(ctx, x, y) {
		ctx.fillStyle = "white";
		ctx.font = "30px Arial"; // Taille et style de police
		ctx.fillText(this.score, x, y); // Affichage du score
	}
}