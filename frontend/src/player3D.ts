import * as GUI from 'babylonjs-gui';

export class Player3D {
	name: string;
	score: number;
	scoreText: GUI.TextBlock;

	constructor(name: string) {
		this.name = name;
		this.score = 0;
		this.scoreText = new GUI.TextBlock(name + "scoreMessage");
		this.scoreText.text = this.score.toString();
		this.scoreText.color = "#f9d3d9";
		this.scoreText.fontSize = 30;
		this.scoreText.fontFamily = "Mochiy Pop P One";
		this.scoreText.outlineWidth = 4;
		this.scoreText.outlineColor = "#333";
	}

	drawScore(x: number, y: number, advancedTexture: GUI.AdvancedDynamicTexture): void {
		this.scoreText.left = x + "%";
		this.scoreText.top = y + "%";
		
		if (!advancedTexture.getControlByName(this.name + "scoreMessage")) {
			advancedTexture.addControl(this.scoreText);
		}
	}
}