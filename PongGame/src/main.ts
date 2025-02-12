import { startPingPongGame } from './game.js';

// Gestion de l'affichage entre le menu et le jeu
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const game = document.getElementById('game') as HTMLElement;

// Vérification que l'élément startButton existe avant d'ajouter l'écouteur
if (startButton) {
	startButton.addEventListener('click', function() {
		// Cacher le menu
		menu.style.display = 'none';
		// Afficher le jeu
		game.style.display = 'block';

		// Manipulation de l'historique (ajouter un état pour le jeu)
		history.pushState({ page: 'game' }, 'Jeu', '#game');

		// Démarrer le jeu
		startPingPongGame();
	});
}
