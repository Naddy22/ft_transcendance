import { Ball } from './ball.js';
import { Paddle } from './paddle.js';
import { Player } from './player.js';

let gameLoopId: number | null = null;
let gameStarted = false; // Variable pour savoir si le jeu a commencé

// Fonction pour démarrer le jeu
export function startPongGame(): void {
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

	const ball = new Ball(canvas.width, canvas.height);
	const rightPaddle = new Paddle(canvas.width - 20, canvas.height / 2);
	const leftPaddle = new Paddle(10, canvas.height / 2);
	const rightPlayer = new Player("Player 2");
	const leftPlayer = new Player("Player 1");

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

	// Fonction pour dessiner tout le jeu
	function draw(): void {
		ctx.fillStyle = "black";  // Fond noir
		ctx.fillRect(0, 0, canvas.width, canvas.height); // Efface l'écran
		ball.draw(ctx);  // Dessine la balle
		leftPaddle.draw(ctx);// Dessine la raquette gauche
		rightPaddle.draw(ctx);
		leftPlayer.drawScore(ctx, 20, 40);
		const rightScoreWidth = ctx.measureText(rightPlayer.score.toString()).width;
		rightPlayer.drawScore(ctx, canvas.width - rightScoreWidth - 20, 40);
	}

	// Mettre à jour la position de la balle
	function update(): void {
		ball.update(canvas.height, leftPaddle, rightPaddle)

		if (ball.x - ball.radius <= 0) {
			rightPlayer.score++;  // Si la balle sort à gauche, le joueur de droite marque
			gameStarted = false;
			if (rightPlayer.score >= MAX_SCORE) {
				endGame(rightPlayer.name); // Fin du jeu si le joueur de droite atteint le score limite
				return;
			}
			leftPaddle.reset(canvas.height / 2 - leftPaddle.height / 2);
			rightPaddle.reset(canvas.height / 2 - rightPaddle.height / 2);
			ball.reset(true);  // Le joueur gauche sert
		} else if (ball.x + ball.radius >= canvas.width) {
			leftPlayer.score++;  // Si la balle sort à droite, le joueur de gauche marque
			gameStarted = false;
			if (leftPlayer.score >= MAX_SCORE) {
				endGame(leftPlayer.name); // Fin du jeu si le joueur de gauche atteint le score limite
				return;
			}
			leftPaddle.reset(canvas.height / 2 - leftPaddle.height / 2);
			rightPaddle.reset(canvas.height / 2 - rightPaddle.height / 2);
			ball.reset(false);  // Le joueur droit sert
		}
		
		leftPaddle.update(canvas.height);
		rightPaddle.update(canvas.height);
	}

	// Fonction pour réinitialiser le jeu
	function resetGame(): void {
		const endScreen = document.getElementById('endScreen'); // Supprime l'écran de fin
		if (endScreen)
			endScreen.remove();
		if (canvas)
			canvas.style.display = 'block';

		leftPlayer.score = 0;
		rightPlayer.score = 0;

		const serves = Math.random() < 0.5;
		ball.reset(serves);
		leftPaddle.reset(canvas.height / 2 - leftPaddle.height / 2);
		rightPaddle.reset(canvas.height / 2 - rightPaddle.height / 2);
		stopPongGame();
		gameLoop(); // Redémarre la boucle du jeu
	}

	// Fonction pour afficher le gagnant et arrêter le jeu
	function endGame(winner: string) {
		const gameContainer = document.getElementById('game') as HTMLElement;
		if (!gameContainer)
			return;

		// Cacher le canvas
		const canvas = document.getElementById('gameCanvas') as HTMLElement;
		if (canvas) canvas.style.display = 'none';

		// Vérifie si l'écran de fin existe déjà
		const existingEndScreen = document.getElementById('endScreen');
		if (!existingEndScreen) {
			// Créer un nouvel écran de fin si ce n'est pas déjà fait
			const endScreen = document.createElement('div');
			endScreen.id = 'endScreen';
			endScreen.style.textAlign = 'center';
			endScreen.style.color = 'white';
			endScreen.innerHTML = `
			<h1>${winner} a gagné !</h1>
			<button id="restartButton">Rejouer</button>`;
			// Ajouter l'écran de fin au conteneur de jeu
			gameContainer.appendChild(endScreen);
			
			// Ajouter un événement pour le bouton "Rejouer"
			const restartButton = document.getElementById('restartButton') as HTMLButtonElement;
			// console.log("je passe ici?");
			if (restartButton) {
				restartButton.addEventListener('click', resetGame);
			}
		}
	}

	document.addEventListener("keydown", (event: KeyboardEvent) : void => {
		if (event.key === "w") leftPaddle.movingUp = true;
		if (event.key === "s") leftPaddle.movingDown = true;
		if (event.key === "ArrowUp") rightPaddle.movingUp = true;
		if (event.key === "ArrowDown") rightPaddle.movingDown = true;
	});
	
	document.addEventListener("keyup", (event: KeyboardEvent) : void => {
		if (event.key === "w") leftPaddle.movingUp = false;
		if (event.key === "s") leftPaddle.movingDown = false;
		if (event.key === "ArrowUp") rightPaddle.movingUp = false;
		if (event.key === "ArrowDown") rightPaddle.movingDown = false;
	});

	document.addEventListener("keydown", (event) => {
		if (event.code === "Space" && !gameStarted) {
			gameStarted = true;
			gameLoop();
		}
	});

	// Boucle du jeu (rafraîchissement)
	function gameLoop() : void {
		draw();
		if (!gameStarted) {
			ctx.fillStyle = "white";
			ctx.font = "20px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Appuyez sur ESPACE pour commencer", canvas.width / 2, canvas.height / 2 - 75);
			return; // On arrête ici tant que le jeu n'a pas commencé
		}
		update(); // Met à jour la position de la balle
		draw(); // Dessine la balle à sa nouvelle position
		gameLoopId = requestAnimationFrame(gameLoop);  // Recommence à l'infini
	}

	// Démarrer le jeu
	gameLoop();
}

export function stopPongGame(): void {
	console.log('stopPongGame appelé, gameLoopId:', gameLoopId);
	if (gameLoopId !== null) {
		cancelAnimationFrame(gameLoopId); // Stoppe la boucle en cours
	}
	gameLoopId = null; // Réinitialise l'ID de la boucle
	gameStarted = false;
}
