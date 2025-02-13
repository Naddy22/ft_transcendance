export class Player3D {
	name: string;
	score: number;

	constructor(name: string) {
		this.name = name;
		this.score = 0;
	}
	drawScore(ctx: CanvasRenderingContext2D, x: number, y: number) {
		ctx.fillStyle = "white";
		ctx.font = "30px Arial"; // Taille et style de police
		ctx.fillText(this.score.toString(), x, y); // Affichage du score
	}
}