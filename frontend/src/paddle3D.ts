import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'; // Charge tous les loaders, y compris glTF

export class Paddle3D {
	mesh: BABYLON.Mesh | null = null;
	width: number;
	height: number;
	depth: number;
	dy: number;
	movingUp: boolean;
	movingDown: boolean;
	initialY: number; // On stocke la position initiale en Y
	isAI: boolean;
	targetY: number | null = null; // Nouvelle propriété pour stocker la cible

	/**
	 * @param scene La scène BabylonJS.
	 * @param width La largeur du paddle (en unités).
	 * @param height La hauteur du paddle (en unités).
	 * @param depth La profondeur du paddle (en unités).
	 * @param x Position X initiale.
	 * @param y Position Y initiale.
	 */
	constructor(
	scene: BABYLON.Scene,
	x: number,
	y: number, 
	side: string,
	isAI = false
	) {
		// this.width = 0.33; //largeur
		// this.height = 3.33; // hauteur
		// this.depth = 0.5; // profondeur pour rester fin
		this.width = 1; //largeur
		this.height = 5; // hauteur
		this.depth = 1; // profondeur pour rester fin
		this.dy = 0.2; // Vitesse de déplacement (en unités par frame ou par update)
		this.movingUp = false;
		this.movingDown = false;
		this.initialY = y; // On sauvegarde la position initiale (centré)
		this.isAI = isAI;

		// // Crée le paddle comme une boîte
		// this.mesh = BABYLON.MeshBuilder.CreateBox("paddle", { width: this.width, height: this.height, depth: this.depth }, scene);
		// // Positionne le paddle sur le plan XY
		// this.mesh.position = new BABYLON.Vector3(x, y, 0);

		// Charger le modèle 3D pour la raquette
		BABYLON.SceneLoader.ImportMesh(
			"",
			"/models/paw/",
			"scene.gltf",
			scene,
			(meshes) => {
				// On suppose que le premier mesh importé est celui que tu souhaites utiliser pour la raquette
				this.mesh = meshes[0] as BABYLON.Mesh;
				// Appliquer le scale pour ajuster la taille
				this.mesh.scaling = new BABYLON.Vector3(10, 10, 5);
				// Positionner la raquette sur le plan XY
				this.mesh.position = new BABYLON.Vector3(x, y, 0);
				// Inverser l'orientation pour le côté droit
				if (side === "right") {
					this.mesh.scaling.x *= -1;
				}
				// Par exemple, si tu veux que l'origine (pivot) soit à la base de la raquette :
				this.mesh.setPivotPoint(new BABYLON.Vector3(0, 0.2, 0));
			}
		  );
	  
	}

	update(sceneHeight: number): void {
		if (!this.mesh) {
			console.log("Mesh non défini, update annulé");
			return; // Sécurité avant chargement
		}
		const halfSceneHeight = sceneHeight / 2;

		// Si le paddle doit se déplacer vers le haut et qu'il ne dépasse pas le bord supérieur
		if (this.movingUp && (this.mesh.position.y + this.height / 2 < halfSceneHeight)) {
			this.mesh.position.y += this.dy;
			// Arrêter si proche de initialY en montant
			if (this.isAI && this.targetY !== null && this.mesh.position.y >= this.targetY - 0.1) {
				this.mesh.position.y = this.targetY; // Aligner précisément
				this.movingUp = false; //simuler keyup
			}
		}
		// Si le paddle doit se déplacer vers le bas et qu'il ne dépasse pas le bord inférieur
		if (this.movingDown && (this.mesh.position.y - this.height / 2 > -halfSceneHeight)) {
			this.mesh.position.y -= this.dy;
			// Arrêter si proche de initialY en descendant
			if (this.isAI && this.targetY !== null && this.mesh.position.y <= this.targetY + 0.1) {
				this.mesh.position.y = this.targetY;
				this.movingDown = false; // Simuler un "keyup"
			}
		}
	}

	// simuler pour que l'ia agisse comme un humain
	simulateKeyPress(up: boolean, down: boolean, targetY?: number): void {
		this.movingUp = up;
		this.movingDown = down;
		if (this.isAI) this.targetY = targetY !== undefined ? targetY : null; // Stocker la cible pour l’IA
	}

	/**
	* Réinitialise le paddle à une position verticale donnée (par exemple, le centre de la zone de jeu).
	* @param y La position verticale de réinitialisation.
	*/
	reset(): void {
		if (!this.mesh) {
			console.log("Mesh non défini, reset annulé");
			return; // Sécurité avant chargement
		}
		this.mesh.position.y = this.initialY;
	}
}
