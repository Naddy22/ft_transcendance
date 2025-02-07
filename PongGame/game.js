import { Ball } from './ball.js';
import { Paddle } from './paddle.js';
import { Player } from './player.js';

  // Fonction pour démarrer le jeu
export function startPingPongGame() {
	const canvas = document.getElementById('gameCanvas');
	const ctx = canvas.getContext('2d');

	const ball = new Ball(canvas.width, canvas.height);
	const rightPaddle = new Paddle(canvas.width - 20, canvas.height / 2 - 30);
	const leftPaddle = new Paddle(10, canvas.height / 2 - 30);
	const rightPlayer = new Player("Player 2");
	const leftPlayer = new Player("Player 1");

	// Une fois que tes joueurs sont créés, mets à jour le DOM pour afficher leurs noms
	function updatePlayerNames() {
		// Sélectionner les éléments du DOM et assigner les noms des joueurs
		document.getElementById('leftPlayerName').textContent = leftPlayer.name;
		document.getElementById('rightPlayerName').textContent = rightPlayer.name;
	}

	updatePlayerNames();

	// Fonction pour dessiner tout le jeu
	function draw() {
		ctx.fillStyle = "black";  // Fond noir
		ctx.fillRect(0, 0, canvas.width, canvas.height); // Efface l'écran
		ball.draw(ctx);  // Dessine la balle
		leftPaddle.draw(ctx);// Dessine la raquette gauche
		rightPaddle.draw(ctx);
		// ctx.fillStyle = "black";
		// ctx.fillRect(0, 0, canvas.width, 50); // Efface uniquement la partie du score
		// ctx.clearRect(0, 0, canvas.width, 50);
		leftPlayer.drawScore(ctx, 20, 40);
		const rightScoreWidth = ctx.measureText(rightPlayer.score).width;
		rightPlayer.drawScore(ctx, canvas.width - rightScoreWidth - 20, 40);
	}

	// Mettre à jour la position de la balle
	function update() {
		ball.update(canvas.height, leftPaddle, rightPaddle)
		
		// // Vérifier collision avec la raquette gauche
		// if (
		// 	ball.x - ball.radius <= leftPaddle.x + leftPaddle.width && // La balle atteint la raquette
		// 	ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + leftPaddle.height // Elle est dans la hauteur de la raquette
		// ) {
		// 	ball.dx *= -1; // Inverse la direction horizontale
		// }

		// // Vérifier collision avec la raquette droite
		// if (
		// 	ball.x + ball.radius >= rightPaddle.x && // La balle atteint la raquette
		// 	ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + rightPaddle.height // Elle est dans la hauteur de la raquette
		// ) {
		// 	ball.dx *= -1; // Inverse la direction horizontale
		// }

		if (ball.x - ball.radius <= 0) {
			rightPlayer.score++;  // Si la balle sort à gauche, le joueur de droite marque
			ball.reset(true);  // Le joueur gauche sert
		} else if (ball.x + ball.radius >= canvas.width) {
			leftPlayer.score++;  // Si la balle sort à droite, le joueur de gauche marque
			ball.reset(false);  // Le joueur droit sert
		}
		
		leftPaddle.update(canvas.height);
		rightPaddle.update(canvas.height);
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "w") leftPaddle.movingUp = true;
		if (event.key === "s") leftPaddle.movingDown = true;
		if (event.key === "ArrowUp") rightPaddle.movingUp = true;
		if (event.key === "ArrowDown") rightPaddle.movingDown = true;
	});
	
	document.addEventListener("keyup", (event) => {
		if (event.key === "w") leftPaddle.movingUp = false;
		if (event.key === "s") leftPaddle.movingDown = false;
		if (event.key === "ArrowUp") rightPaddle.movingUp = false;
		if (event.key === "ArrowDown") rightPaddle.movingDown = false;
	});

	// Boucle du jeu (rafraîchissement)
	function gameLoop() {
		update();  // Met à jour la position de la balle
		draw();    // Dessine la balle à sa nouvelle position
		requestAnimationFrame(gameLoop);  // Recommence à l'infini
	}

	// Démarrer le jeu
	gameLoop();
}