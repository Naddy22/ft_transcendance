import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { Ball3D } from './ball3D.js';
import { Paddle3D } from './paddle3D.js';
import { Player3D } from './player3D.js';

let engine: BABYLON.Engine;
let guiTexture: GUI.AdvancedDynamicTexture;
let gameStarted: boolean = false; // Variable pour savoir si le jeu a commencé

//nettoie les ecouteurs precedents sinon espace garde en memoire parti d'Avant
let activeListeners: { type: string; listener: EventListener }[] = []; // Ajoute cette ligne au début du fichier

function removeListeners(): void {
	console.log("Suppression des écouteurs existants, nombre actuel :", activeListeners.length);
	activeListeners.forEach(({ type, listener }, index) => {
		console.log(`Suppression de l’écouteur ${index + 1} : ${type}`);
		window.removeEventListener(type, listener);
	});
	activeListeners = [];
}

export function startPongGame3D(leftPlayerName: string, rightPlayerName: string, isVsAI: boolean, onGameEnd: (winner: string) => void): void {
	console.log("Début startPongGame3D pour", leftPlayerName, "vs", rightPlayerName, "- gameStarted:", gameStarted);
	removeListeners(); // Ajoute ceci pour nettoyer les anciens écouteurs
	console.log("Écouteurs supprimés, activeListeners devrait être vide :", activeListeners.length);
	gameStarted = false; // Réinitialise explicitement

	if (engine) {
		console.log("Arrêt de l’ancien engine avant réinitialisation");
		engine.stopRenderLoop();
		engine.dispose(); // Ajoute ceci pour nettoyer l’ancien engine
	}
	
	// 1. Récupère le canvas et crée le moteur BabylonJS
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	// const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	
	engine = new BABYLON.Engine(canvas, true);

	const leftPlayer = new Player3D(leftPlayerName);
	const rightPlayer = new Player3D(rightPlayerName);

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

	function createGUI(scene: BABYLON.Scene): GUI.AdvancedDynamicTexture {
		const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		
		const startMessage = new GUI.TextBlock("startMessage");
		startMessage.text = "Appuyez sur ESPACE pour commencer";
		startMessage.color = "#f9d3d9"; //rose pastel
		startMessage.fontSize = 20;
		startMessage.fontFamily = "Mochiy Pop P One"; // Police kawaii
		startMessage.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		startMessage.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		startMessage.top = "-75px";
		startMessage.outlineWidth = 4; // Contour noir pour contraste
		startMessage.outlineColor = "#333"; // Contour sombre
		advancedTexture.addControl(startMessage);

		// Écran de chargement
		const loadingBackground = new GUI.Rectangle("loadingBackground");
		loadingBackground.width = 1.0;
		loadingBackground.height = 1.0;
		loadingBackground.background = "rgb(229, 251, 201)"; // Fond sombre semi-transparent
		advancedTexture.addControl(loadingBackground);
	
		const loadingText = new GUI.TextBlock("loadingText");
		loadingText.text = "Chargement en cours...";
		loadingText.color = "black";
		loadingText.fontSize = 30;
		loadingText.fontFamily = "Mochiy Pop P One";
		loadingText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		loadingText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		loadingBackground.addControl(loadingText);
		
		return advancedTexture;
	}
	

	// Création de la scène
	const createScene = (): BABYLON.Scene => {
		const scene = new BABYLON.Scene(engine);
		guiTexture = createGUI(scene);

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
		// // On n'attache pas les contrôles si on veut garder la vue fixe
		// camera.attachControl(canvas, false);
		
		const desiredSceneWidthUnits = 25.3;
		let scale = canvas.width / desiredSceneWidthUnits;
		// const scale = 23.7; //(fonctionne pour 600px par 400px)
		// const scale = 35.5; //fonctionne pour 900px par 600px
		// Pour une zone de jeu de 20 unités de large (de -10 à 10)
		const sceneWidthUnits = canvas.width / scale;
		const sceneHeightUnits = canvas.height / scale;

		// // pour mettre des bordures pour test
		// const halfWidth = sceneWidthUnits / 2;
		// const halfHeight = sceneHeightUnits / 2;
		// const borderPoints = [
		// 	new BABYLON.Vector3(-halfWidth, -halfHeight, 0),
		// 	new BABYLON.Vector3(halfWidth, -halfHeight, 0),
		// 	new BABYLON.Vector3(halfWidth, halfHeight, 0),
		// 	new BABYLON.Vector3(-halfWidth, halfHeight, 0),
		// 	new BABYLON.Vector3(-halfWidth, -halfHeight, 0)
		// ];
		// const border = BABYLON.MeshBuilder.CreateLines("border", { points: borderPoints }, scene);
		// border.color = new BABYLON.Color3(1, 0, 0); // rouge
	
		// Ajout du sol grace a photo importer
		const ground = BABYLON.MeshBuilder.CreatePlane("ground", { width: sceneWidthUnits + 5, height: sceneHeightUnits + 5}, scene);
		ground.rotation.x = 0; // Oriente le plan horizontalement
		ground.position.z = 0.8; // Légèrement derrière les objets pour éviter le z-fighting
		const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("/textures/grass-draw.jpg", scene);
		groundMaterial.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15); // Supprime la réflexion spéculaire
		// groundMaterial.roughness = 1.0; // Rend le matériau mat (moins de brillance)
		ground.material = groundMaterial;

		// Ajouter une lumière
		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 0, -1), scene);
	
		// Création de la balle au centre et attends chargement
		const ball = new Ball3D(scene, 0.5, 0, 0);

		const offset = 0.5; // Pour ecarter un peu mes raquettes du bord
		const leftPaddle = new Paddle3D(scene, -sceneWidthUnits / 2 + offset, 0, "left");
		const rightPaddle = new Paddle3D(scene, sceneWidthUnits / 2 - offset, 0, "right", isVsAI);


		// Placer les scores sur l'interface GUI (les positions en pixels sont à ajuster selon ton design)
		leftPlayer.drawScore(-42, -45, guiTexture); // à gauche
		rightPlayer.drawScore(42, -45, guiTexture); // à droite

		
		// 6. Gestion des entrées clavier pour les paddles et pour démarrer le jeu
		const keydownHandler = ((event: KeyboardEvent) => {
			if (event.key === "w") leftPaddle.movingUp = true;
			if (event.key === "s") leftPaddle.movingDown = true;
			if (!isVsAI) {
				if (event.key === "ArrowUp") rightPaddle.movingUp = true;
				if (event.key === "ArrowDown") rightPaddle.movingDown = true;
			}
			if (event.code === "Space" && !gameStarted) {
				console.log("Tentative ESPACE - Mesh : Ball:", !!ball.mesh, "Left Paddle:", !!leftPaddle.mesh, "Right Paddle:", !!rightPaddle.mesh);
				if (ball.mesh && leftPaddle.mesh && rightPaddle.mesh) {
					console.log("ESPACE accepté, jeu démarré");
					gameStarted = true;
				} else {
					console.log("ESPACE bloqué, modèles non chargés");
				}
			}
		}) as EventListener;
		const keyupHandler = ((event: KeyboardEvent) => {
			if (event.key === "w") leftPaddle.movingUp = false;
			if (event.key === "s") leftPaddle.movingDown = false;
			if (!isVsAI) {
				if (event.key === "ArrowUp") rightPaddle.movingUp = false;
				if (event.key === "ArrowDown") rightPaddle.movingDown = false;
			}
		}) as EventListener;
		
		window.addEventListener("keydown", keydownHandler);
		window.addEventListener("keyup", keyupHandler);
		activeListeners.push({ type: "keydown", listener: keydownHandler });
		activeListeners.push({ type: "keyup", listener: keyupHandler });
		console.log("Écouteurs ajoutés, total actuel :", activeListeners.length);
		
		// IA pour le paddle droit si isVsAI
		if (isVsAI) {
			setInterval(() => {
				if (gameStarted && ball.mesh && rightPaddle.mesh) {
					updateAIDecision(rightPaddle, ball, sceneHeightUnits);
				}
			}, 1000); // Refresh toutes les secondes
		}

		function updateAIDecision(aiPaddle: Paddle3D, ball: Ball3D, sceneHeight: number): void {
			if (!aiPaddle.isAI || !aiPaddle.mesh || !gameStarted || !ball.mesh) {
				console.log("IA arrêtée : conditions non remplies");
				return;
			}
			let ballFutureY = 0;
			// 🛑 Vérifier si la balle va réellement vers l'IA
			if (ball.dx <= 0) {
				console.log("🎮 IA: La balle s'éloigne, retour à la position initiale");
				ballFutureY = aiPaddle.initialY; // Retour à la position initiale en cas d’éloignement
			} else {
				// 🧠 Calculer où la balle arrivera lorsque qu'elle atteindra l'IA
				let timeToReach = (aiPaddle.mesh.position.x - ball.mesh.position.x) / ball.dx;
				let ballFutureY = ball.mesh.position.y + ball.dy * timeToReach;

				// 🎯 Gestion des rebonds (éviter que l'IA poursuive une balle après un mur)
				const topWall = sceneHeight / 2 - ball.radius;
				const bottomWall = -sceneHeight / 2 + ball.radius;

				while (ballFutureY > topWall || ballFutureY < bottomWall) {
					if (ballFutureY > topWall) {
						ballFutureY = topWall - (ballFutureY - topWall);
					} else if (ballFutureY < bottomWall) {
						ballFutureY = bottomWall + (bottomWall - ballFutureY);
					}
				}

				// 🎮 Déplacement de l'IA (ajout d'une zone morte)
				const paddleCenterY = aiPaddle.mesh.position.y;
				const threshold = 1.5; // Zone morte pour éviter un tremblement constant
				
				let moveUp = false;
				let moveDown = false;

				if (ballFutureY < paddleCenterY - threshold) {
					moveDown = true; // Descend si balle plus bas
				} else if (ballFutureY > paddleCenterY + threshold) {
					moveUp = true; // Monte si balle plus haut
				}

				console.log(`🎮 IA: BallY=${ballFutureY}, PaddleY=${paddleCenterY}, UP=${moveUp}, DOWN=${moveDown}`);
				aiPaddle.simulateKeyPress(moveUp, moveDown);

			// // Prédiction simplifiée
			// let ballFutureY = ball.mesh.position.y + ball.dy * 30;
			// let ballFutureX = ball.mesh.position.x + ball.dx * 30;

			// // Limiter aux murs
			// const topWall = sceneHeight / 2 - ball.radius;
			// const bottomWall = -sceneHeight / 2 + ball.radius;
			// if (ballFutureY > topWall) {
			// 	ballFutureY = topWall - (ballFutureY - topWall);
			// } else if (ballFutureY < bottomWall) {
			// 	ballFutureY = bottomWall + (ballFutureY - bottomWall);
			// }

			// // Décision
			// const paddleCenterY = aiPaddle.mesh.position.y;
			// const threshold = 2;
			// let moveUp = false;
			// let moveDown = false;

			// if (ballFutureX > 0) { // Balle vient vers l’IA
			// 	if (ballFutureY < paddleCenterY - threshold) {
			// 		moveUp = false;
			// 		moveDown = true; // Descend si balle plus bas
			// 	} else if (ballFutureY > paddleCenterY + threshold) {
			// 		moveDown = false;
			// 		moveUp = true; // Monte si balle plus haut
			// 	}
			// } else {
			// 	// Revenir vers initialY quand la balle s’éloigne
			// 	if (paddleCenterY > aiPaddle.initialY + threshold) {
			// 		moveDown = true; // Descend vers initialY
			// 	} else if (paddleCenterY < aiPaddle.initialY - threshold) {
			// 		moveUp = true; // Monte vers initialY
			// 	}
			// }

			// // Éviter les oscillations rapides
			// if (moveUp && moveDown) {
			// 	moveUp = false;
			// 	moveDown = false; // Ne bouge pas si conflit
			// }

			}
		}

		function update(): void {
			if (!ball.mesh) return; // Sécurité avant chargement
			ball.update(sceneHeightUnits, leftPaddle, rightPaddle);
			// Ici, tu pourras ajouter ta logique de détection des buts, réinitialisation, etc.
			
			if (ball.mesh.position.x - ball.radius <= -sceneWidthUnits / 2) {
				rightPlayer.score++;  // Si la balle sort à gauche, le joueur de droite marque
				rightPlayer.scoreText.text = rightPlayer.score.toString();
				gameStarted = false;
				if (rightPlayer.score >= MAX_SCORE) {
					endGame(rightPlayer.name); // Fin du jeu si le joueur de droite atteint le score limite
					return;
				}
				leftPaddle.reset();
				rightPaddle.reset();
				ball.reset(true);  // Le joueur gauche sert
			}
			else if (ball.mesh.position.x + ball.radius >= sceneWidthUnits / 2) {
				leftPlayer.score++;  // Si la balle sort à droite, le joueur de gauche marque
				leftPlayer.scoreText.text = leftPlayer.score.toString();
				gameStarted = false;
				if (leftPlayer.score >= MAX_SCORE) {
					endGame(leftPlayer.name); // Fin du jeu si le joueur de gauche atteint le score limite
					return;
				}
				leftPaddle.reset();
				rightPaddle.reset();
				ball.reset(false);  // Le joueur droit sert
			}

			leftPaddle.update(sceneHeightUnits);
			rightPaddle.update(sceneHeightUnits);
		}

		// Fonction pour afficher le gagnant et arrêter le jeu
		function endGame(winner: string) {
			// // Vérifier si l'écran de fin existe déjà
			// let endPanel = guiTexture.getControlByName("endPanel") as GUI.StackPanel;
			// if (!endPanel) {
			// 	// Créer un panneau pour contenir les éléments de l'écran de fin
			// 	endPanel = new GUI.StackPanel("endPanel");
			// 	endPanel.width = "400px";
			// 	endPanel.height = "200px";
			// 	endPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
			// 	endPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
			// 	endPanel.background = "black"; // ou une couleur avec opacité
			// 	guiTexture.addControl(endPanel);
				
			// 	// Créer un TextBlock pour afficher le message du gagnant
			// 	const endMessage = new GUI.TextBlock("endMessage");
			// 	endMessage.text = `${winner} a gagné !`;
			// 	endMessage.color = "white";
			// 	endMessage.fontSize = 30;
			// 	endMessage.height = "100px";
			// 	endPanel.addControl(endMessage);
				
			// 	// // Créer un bouton pour rejouer
			// 	// const restartButton = GUI.Button.CreateSimpleButton("restartButton", "Rejouer");
			// 	// restartButton.width = "200px";
			// 	// restartButton.height = "50px";
			// 	// restartButton.color = "white";
			// 	// restartButton.background = "gray";
			// 	// restartButton.onPointerUpObservable.add(() => {
			// 	// 	// Lorsque le bouton est cliqué, on appelle le resetGame
			// 	// 	resetGame();
			// 	// 	// Masquer l'écran de fin
			// 	// 	endPanel.isVisible = false;
			// 	// });
			// 	// endPanel.addControl(restartButton);
			// }
			// // Rendre visible l'écran de fin
			// endPanel.isVisible = true;

			// // Arrête complètement le jeu
			stopPongGame3D();

			// resetGame(); // a ajouté si je veux reset avant d'Avoir msg de fin

			// Appelle le callback ici pour informer du gagnant
			onGameEnd(winner);
		}

		// // Fonction pour réinitialiser le jeu
		// function resetGame(): void {
		// 	// const endScreen = document.getElementById('endScreen'); // Supprime l'écran de fin
		// 	// if (endScreen)
		// 	// 	endScreen.remove();
		// 	// if (canvas)
		// 	// 	canvas.style.display = 'block';
	
		// 	leftPlayer.score = 0;
		// 	leftPlayer.scoreText.text = leftPlayer.score.toString();
		// 	rightPlayer.score = 0;
		// 	rightPlayer.scoreText.text = rightPlayer.score.toString();
	
		// 	const serves = Math.random() < 0.5;
		// 	ball.reset(serves);
		// 	leftPaddle.reset();
		// 	rightPaddle.reset();
		// }

		// 7. La boucle de jeu : ici, on met à jour la logique avant chaque rendu de la scène
		scene.registerBeforeRender(() => {
			const startMsg = guiTexture.getControlByName("startMessage") as GUI.TextBlock;
			const loadingBg = guiTexture.getControlByName("loadingBackground") as GUI.Rectangle;
			console.log("Avant rendu - gameStarted:", gameStarted, "Mesh : Ball:", !!ball.mesh, "Left Paddle:", !!leftPaddle.mesh, "Right Paddle:", !!rightPaddle.mesh);
			if (!ball.mesh || !leftPaddle.mesh || !rightPaddle.mesh)
			{
				if (startMsg) startMsg.isVisible = false; // Cache le message de départ
				if (loadingBg) loadingBg.isVisible = true; // Affiche l’écran de chargement
				return;
			}
			// Une fois chargé, masque l’écran de chargement
			if (loadingBg) loadingBg.isVisible = false;
			if (!gameStarted) {
				if (startMsg) {
					startMsg.isVisible = true;
				}
				return;
			}
			startMsg.isVisible = false;

			update();
		});

		return scene;
	};
	
	const scene = createScene();
	engine.runRenderLoop(() => scene.render());
	window.addEventListener('resize', () => engine.resize());
}

export function stopPongGame3D(): void {
	gameStarted = false;
	if (!engine) {
		return;
	}
	// engine.dispose(); // Ajouter ceci pour nettoyer l’ancien engine mais on voit plus le jeu en fond quand le message "joueur x a gagné"
	engine.stopRenderLoop();
	removeListeners();
}
