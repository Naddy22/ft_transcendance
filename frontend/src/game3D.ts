import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { Ball3D } from './ball3D.js';
import { Paddle3D } from './paddle3D.js';
import { Player3D } from './player3D.js';
import { getTranslation } from './language.js';

let engine: BABYLON.Engine;
let guiTexture: GUI.AdvancedDynamicTexture;
let gameStarted: boolean = false;

let activeListeners: { type: string; listener: EventListener }[] = [];

//cleans previous headphones
function removeListeners(): void {
	activeListeners.forEach(({ type, listener }, index) => {
		window.removeEventListener(type, listener);
	});
	activeListeners = [];
}

export function startPongGame3D(leftPlayerName: string, rightPlayerName: string, isVsAI: boolean, onGameEnd: (winner: string) => void): void {
	removeListeners();
	gameStarted = false;
	if (engine) {
		engine.stopRenderLoop();
		engine.dispose();
	}
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	engine = new BABYLON.Engine(canvas, true);

	const leftPlayer = new Player3D(leftPlayerName);
	const rightPlayer = new Player3D(rightPlayerName);

	const MAX_SCORE = 3;

	// Update DOM with player name
	function updatePlayerNames(): void {
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
		startMessage.text = getTranslation("startGameMessage");
		startMessage.color = "#f9d3d9";
		startMessage.fontSize = 20;
		startMessage.fontFamily = "Mochiy Pop P One";
		startMessage.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		startMessage.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		startMessage.top = "-75px";
		startMessage.outlineWidth = 4;
		startMessage.outlineColor = "#333";
		advancedTexture.addControl(startMessage);

		// loading screen
		const loadingBackground = new GUI.Rectangle("loadingBackground");
		loadingBackground.width = 1.0;
		loadingBackground.height = 1.0;
		loadingBackground.background = "rgb(229, 251, 201)";
		advancedTexture.addControl(loadingBackground);
	
		const loadingText = new GUI.TextBlock("loadingText");
		loadingText.text = getTranslation("loadingGameText");
		loadingText.color = "black";
		loadingText.fontSize = 30;
		loadingText.fontFamily = "Mochiy Pop P One";
		loadingText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		loadingText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		loadingBackground.addControl(loadingText);

		document.addEventListener("languageChanged", () => {
			startMessage.text = getTranslation("startGameMessage");
			loadingText.text = getTranslation("loadingGameText");
		});
		return advancedTexture;
	}
	
	const createScene = (): BABYLON.Scene => {
		const scene = new BABYLON.Scene(engine);
		guiTexture = createGUI(scene);

		const camera = new BABYLON.ArcRotateCamera(
			"topCamera",
			-Math.PI / 2, // alpha
			Math.PI / 2, // beta
			20, // radius
			BABYLON.Vector3.Zero(),
			scene
		);

		// // Optional camera control
		// camera.attachControl(canvas, false);
		
		const desiredSceneWidthUnits = 25.3;
		let scale = canvas.width / desiredSceneWidthUnits;
		const sceneWidthUnits = canvas.width / scale;
		const sceneHeightUnits = canvas.height / scale;
	
		const ground = BABYLON.MeshBuilder.CreatePlane("ground", { width: sceneWidthUnits + 5, height: sceneHeightUnits + 5}, scene);
		ground.rotation.x = 0;
		ground.position.z = 0.8;
		const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("/textures/grass-draw.jpg", scene);
		groundMaterial.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
		ground.material = groundMaterial;

		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 0, -1), scene);
	
		const ball = new Ball3D(scene, 0.5, 0, 0);

		const offset = 0.5;
		const leftPaddle = new Paddle3D(scene, -sceneWidthUnits / 2 + offset, 0, "left");
		const rightPaddle = new Paddle3D(scene, sceneWidthUnits / 2 - offset, 0, "right", isVsAI);

		leftPlayer.drawScore(-42, -45, guiTexture);
		rightPlayer.drawScore(42, -45, guiTexture);

		const keydownHandler = ((event: KeyboardEvent) => {
			if (event.key === "w") leftPaddle.movingUp = true;
			if (event.key === "s") leftPaddle.movingDown = true;
			if (!isVsAI) {
				if (event.key === "ArrowUp") rightPaddle.movingUp = true;
				if (event.key === "ArrowDown") rightPaddle.movingDown = true;
			}
			if (event.code === "Space" && !gameStarted) {
				if (ball.mesh && leftPaddle.mesh && rightPaddle.mesh) {
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

		if (isVsAI) {
			setInterval(() => {
				if (gameStarted && ball.mesh && rightPaddle.mesh) {
					updateAIDecision(rightPaddle, ball, sceneWidthUnits, sceneHeightUnits);
				}
			}, 1000);
		}

		function calculateFuturBallY(ball: Ball3D, paddleL: Paddle3D, paddleR: Paddle3D, sceneHeight: number): number {
			if (!ball.mesh || !paddleL.mesh || !paddleR.mesh)
				return 0;
			let futurBallX = ball.mesh.position.x;
			let futurBallY = ball.mesh.position.y;
			let velocityX = ball.dx;
			let velocityY = ball.dy;
			const ballRadius = ball.radius;
			const paddleWidth = 1;
			const acceleration = 1.00025;

			while (futurBallX < (paddleR.mesh.position.x - paddleWidth / 2)) {
				if (futurBallX - velocityX <= (paddleL.mesh.position.x + paddleWidth / 2) && velocityX < 0) {
					velocityX *= -1;
					
					const impact = futurBallY - paddleL.mesh.position.y;
					const maxAngle = Math.PI / 4;
					const angleFactor = (impact / (paddleL.height / 2)) * maxAngle;
					velocityY += Math.sin(angleFactor) * Math.abs(velocityX);
				}
				const topWall = sceneHeight / 2 - ballRadius;
				const bottomWall = -sceneHeight / 2 + ballRadius;
				if (futurBallY + velocityY > topWall && velocityY > 0) {
					velocityY *= -1;
					futurBallY = topWall - (futurBallY + velocityY - topWall);
				} else if (futurBallY + velocityY < bottomWall && velocityY < 0) {
					velocityY *= -1;
					futurBallY = bottomWall + (futurBallY + velocityY - bottomWall);
				}
				velocityX *= acceleration;
				velocityY *= acceleration;
			
				futurBallX += velocityX;
				futurBallY += velocityY;
			}
	
			return futurBallY;
		}

		function updateAIDecision(aiPaddle: Paddle3D, ball: Ball3D, sceneWidth: number, sceneHeight: number): void {
			if (!aiPaddle.isAI || !aiPaddle.mesh || !gameStarted || !ball.mesh) {
				return;
			}
			let ballFutureY: number;
			const paddleCenterY = aiPaddle.mesh.position.y;
			const threshold = 1;

			const closeDistance = sceneWidth / 10;
			if (ball.dx <= 0) {
				ballFutureY = aiPaddle.initialY;
			} else if (Math.abs(aiPaddle.mesh.position.x - ball.mesh.position.x) < closeDistance) {
				ballFutureY = ball.mesh.position.y;
			} else {
				ballFutureY = calculateFuturBallY(ball, leftPaddle, aiPaddle, sceneHeight);
			}
			let moveUp = false;
			let moveDown = false;

			if (ballFutureY > paddleCenterY + threshold) {
				moveUp = true;
			} else if (ballFutureY < paddleCenterY - threshold) {
				moveDown = true;
			} else {
				moveUp = false;
				moveDown = false;
			}
			aiPaddle.simulateKeyPress(moveUp, moveDown, ballFutureY);
		}

		function update(): void {
			if (!ball.mesh) return;
			ball.update(sceneHeightUnits, leftPaddle, rightPaddle);
			
			if (ball.mesh.position.x - ball.radius <= -sceneWidthUnits / 2) {
				rightPlayer.score++;
				rightPlayer.scoreText.text = rightPlayer.score.toString();
				gameStarted = false;
				if (rightPlayer.score >= MAX_SCORE) {
					endGame(rightPlayer.name);
					return;
				}
				leftPaddle.reset();
				rightPaddle.reset();
				ball.reset(true);
			}
			else if (ball.mesh.position.x + ball.radius >= sceneWidthUnits / 2) {
				leftPlayer.score++;
				leftPlayer.scoreText.text = leftPlayer.score.toString();
				gameStarted = false;
				if (leftPlayer.score >= MAX_SCORE) {
					endGame(leftPlayer.name);
					return;
				}
				leftPaddle.reset();
				rightPaddle.reset();
				ball.reset(false);
			}

			leftPaddle.update(sceneHeightUnits);
			rightPaddle.update(sceneHeightUnits);
		}

		function endGame(winner: string) {
			stopPongGame3D();
			onGameEnd(winner);
		}

		scene.registerBeforeRender(() => {
			const startMsg = guiTexture.getControlByName("startMessage") as GUI.TextBlock;
			const loadingBg = guiTexture.getControlByName("loadingBackground") as GUI.Rectangle;
			if (!ball.mesh || !leftPaddle.mesh || !rightPaddle.mesh)
			{
				if (startMsg) startMsg.isVisible = false;
				if (loadingBg) loadingBg.isVisible = true;
				return;
			}
			if (loadingBg)
				loadingBg.isVisible = false;
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
	engine.stopRenderLoop();
	removeListeners();
}
