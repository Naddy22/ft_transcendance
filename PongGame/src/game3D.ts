import * as BABYLON from 'babylonjs';
import { Ball3D } from './ball3D.js';
import { Paddle3D } from './paddle3D.js';
import { Player3D } from './player3D.js';

let gameLoopId: number | null = null;
let gameStarted = false; // Variable pour savoir si le jeu a commencé

export function startPongGame3D(): void {
	// 1. Récupère le canvas et crée le moteur BabylonJS
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const engine = new BABYLON.Engine(canvas, true);

	const leftPlayer = new Player3D("Player 1");
	const rightPlayer = new Player3D("Player 2");
	const MAX_SCORE = 3;

	// Une fois que tes joueurs sont créés, mets à jour le DOM pour afficher leurs noms
	function updatePlayerNames(): void {
		// Sélectionner les éléments du DOM et assigner les noms des joueurs
		const leftPlayerNameElement = document.getElementById('leftPlayerName') as HTMLElement;
		const rightPlayerNameElement = document.getElementById('rightPlayerName') as HTMLElement;

		if (leftPlayerNameElement) {
			leftPlayerNameElement.innerText = leftPlayer.name;
		}
		if (rightPlayerNameElement) {
			rightPlayerNameElement.innerText = rightPlayer.name;
		}
	}
	updatePlayerNames();

	// Création de la scène
	const createScene = (): BABYLON.Scene => {
		const scene = new BABYLON.Scene(engine);

		// Utiliser une ArcRotateCamera pour une vue top-down classique
		// alpha = 0, beta = PI/2 pour regarder directemen t vers le bas
		const camera = new BABYLON.ArcRotateCamera(
			"topCamera",
			-Math.PI / 2,                // alpha
			Math.PI / 2,      // beta
			20,               // radius
			BABYLON.Vector3.Zero(), // cible au centre
			scene
		);
		// On n'attache pas les contrôles si on veut garder la vue fixe
		// camera.attachControl(canvas, false);
	
		// Ajouter une lumière
		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 0, -1), scene);
	
		// Création de la balle au centre
		const ball = new Ball3D(scene, 0.5, 0, 0);
	
		// Pour les raquettes, nous utilisons les mêmes dimensions qu'avant :
		// Conversion 2D => 3D (par exemple, 10px devient ~0.33 unité et 100px ~3.33 unités)
		const paddleWidth = 0.33;   // largeur
		const paddleHeight = 3.33;  // hauteur
		const paddleDepth = 0.5;    // profondeur pour rester fin

		// Pour une zone de jeu de 20 unités de large (de -10 à 10)
		const sceneWidthUnits = 20;
		const offset = -2; // Pour coller de chaque côté mes raquettes aux canvas
		//si j'echange la valeur left et rightPaddle ca fait que la droite est a gauche et inversement
		// donc pas le choix d'inverser, impossible de comprendre pourquoi car le negatif est sensé
		// être la gauche..
		const leftPaddleX = -sceneWidthUnits / 2 + offset;
		const rightPaddleX = sceneWidthUnits / 2 - offset;
		const paddleY = 0; // centré verticalement

		const leftPaddle = new Paddle3D(scene, paddleWidth, paddleHeight, paddleDepth, leftPaddleX, paddleY);
		const rightPaddle = new Paddle3D(scene, paddleWidth, paddleHeight, paddleDepth, rightPaddleX, paddleY);

		// 6. Gestion des entrées clavier pour les paddles et pour démarrer le jeu
		window.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === "w") leftPaddle.movingUp = true;
			if (event.key === "s") leftPaddle.movingDown = true;
			if (event.key === "ArrowUp") rightPaddle.movingUp = true;
			if (event.key === "ArrowDown") rightPaddle.movingDown = true;
			if (event.code === "Space" && !gameStarted) {
			gameStarted = true;
		  }
		});
		window.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === "w") leftPaddle.movingUp = false;
			if (event.key === "s") leftPaddle.movingDown = false;
			if (event.key === "ArrowUp") rightPaddle.movingUp = false;
			if (event.key === "ArrowDown") rightPaddle.movingDown = false;
		});

		// 7. La boucle de jeu : ici, on met à jour la logique avant chaque rendu de la scène
		scene.registerBeforeRender(() => {
			if (gameStarted) {
			ball.update(canvas.height / 30, leftPaddle, rightPaddle);
			leftPaddle.update(canvas.height / 30);
			rightPaddle.update(canvas.height / 30);
			// Ici, tu pourras ajouter ta logique de détection des buts, réinitialisation, etc.
			}
		});

		return scene;
	};
	
	const scene = createScene();
	engine.runRenderLoop(() => scene.render());
	window.addEventListener('resize', () => engine.resize());
}
