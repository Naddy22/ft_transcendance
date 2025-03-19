import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'; // Charge tous les loaders, y compris glTF

// import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';

export class Ball3D {
	mesh: BABYLON.Mesh | null = null; // Nullable jusqu’au chargement;
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

		// // Crée une sphère pour la balle
		// this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: radius * 2 }, scene);
		// // Positionne la balle sur le plan XY (z = 0) (au centre)
		// this.mesh.position = new BABYLON.Vector3(x, y, 0);

		// Initialise la vélocité (pour la direction du mouvement)
		this.dx = Math.random() < 0.5 ? 0.1 : -0.1;
		// this.dx = 0.1;
		this.dy = 0;
	
		// Charger le modèle 3D et l'utiliser comme mesh de la balle
		BABYLON.SceneLoader.ImportMesh("", "/models/wool/", "scene.gltf", scene, (meshes) => {
			console.log("Modèle chargé avec succès", meshes);
			// On suppose que le premier mesh importé est celui de la balle
			this.mesh = meshes[0] as BABYLON.Mesh;

			// Ajuster le scale si besoin pour correspondre à la taille désirée
			this.mesh.scaling = new BABYLON.Vector3(50, 50, 50);
			// Positionner la balle
			this.mesh.position = new BABYLON.Vector3(x, y, 0);

			meshes.forEach(mesh => {
				if (mesh.material) {
					if (mesh.material instanceof BABYLON.PBRMaterial) {
						const pbrMat = mesh.material as BABYLON.PBRMaterial;
						// Si je veux que la texture apparaisse telle quelle, mettre albedoColor à blanc (0,0,0):
						pbrMat.albedoColor = new BABYLON.Color3(10, 10.75, 30.8); //fait un rose
					} else if (mesh.material instanceof BABYLON.StandardMaterial) {
						const stdMat = mesh.material as BABYLON.StandardMaterial;
						stdMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
					}
				}
			});
		}, null, (scene, message, exception) => {
			console.error("Erreur lors du chargement du modèle :", message, exception);
		});
	}

	update(sceneHeight: number, leftPaddle: any, rightPaddle: any): void {
		if (!this.mesh) {
			console.log("Mesh non défini, update annulé");
			return; // Sécurité avant chargement
		}
		// Met à jour la position en ajoutant la vélocité
		this.mesh.position.x += this.dx;
		this.mesh.position.y += this.dy;
		// console.log("Position mise à jour :", this.mesh.position);
		
		// Gestion du rebond sur le haut et le bas de la zone de jeu
		const halfHeight = sceneHeight / 2;
		if (this.mesh.position.y - this.radius <= -halfHeight || this.mesh.position.y + this.radius >= halfHeight) {
		  this.dy *= -1;
		}
	
		if (this.dx < 0) {
			const leftPaddleRightEdge = leftPaddle.mesh.position.x + leftPaddle.width / 2;
			if (this.mesh.position.x - this.radius <= leftPaddleRightEdge) {
				const paddleTop = leftPaddle.mesh.position.y + leftPaddle.height / 2;
				const paddleBottom = leftPaddle.mesh.position.y - leftPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					let angle = (this.mesh.position.y - leftPaddle.mesh.position.y) / (leftPaddle.height / 2);
					this.dy = angle * 0.1;
					this.dx *= -1;
					this.mesh.position.x = leftPaddleRightEdge + this.radius;
				}
			}
		}

		if (this.dx > 0) {
			// Calcul du bord gauche de la raquette droite
			const rightPaddleLeftEdge = rightPaddle.mesh.position.x - rightPaddle.width / 2;
			if (this.mesh.position.x + this.radius >= rightPaddleLeftEdge) {
				const paddleTop = rightPaddle.mesh.position.y + rightPaddle.height / 2;
				const paddleBottom = rightPaddle.mesh.position.y - rightPaddle.height / 2;
				if (this.mesh.position.y <= paddleTop && this.mesh.position.y >= paddleBottom) {
					// Calcul de l'angle en fonction de l'endroit où la balle touche la raquette
					let angle = (this.mesh.position.y - rightPaddle.mesh.position.y) / (rightPaddle.height / 2);
					this.dy = angle * 0.1;  // Ajuster la vitesse verticale
					this.dx *= -1;
					 // Repositionner la balle pour éviter qu'elle ne reste collée
					this.mesh.position.x = rightPaddleLeftEdge - this.radius;
				}
			}
		}
		// Accélération progressive : augmenter légèrement la vitesse à chaque frame
		const acceleration = 1.00025;  // augmente la vitesse de 0.1% par frame
		this.dx *= acceleration;
		this.dy *= acceleration;

		
	}

	reset(rightServes: boolean) {
		if (!this.mesh) return; // Sécurité avant chargement
		
		this.mesh.position.x = this.centerX;
		this.mesh.position.y = this.centerY;
		this.dy = 0;
		// Si le joueur de droite a la main, la balle repart vers la gauche (dx négatif)
		this.dx = rightServes ? -0.1 : 0.1;
	}

	clearMesh():void {
		console.log("Vidage du mesh de la balle");
		if (this.mesh) {
			this.mesh.dispose(); // Supprime le mesh actuel
			this.mesh = null;
		}
	}
}
