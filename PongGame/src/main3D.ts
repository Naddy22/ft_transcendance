import { startPongGame3D as startPongGame } from './game3D.js';
import { stopPongGame3D as stopPongGame } from './game3D.js';

// Gestion de l'affichage entre le menu et le jeu
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const game = document.getElementById('game') as HTMLElement;
// const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

// Définir l'état initial pour le menu
history.replaceState({ page: 'menu' }, 'Menu', '#menu');

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
		startPongGame();
	});
}

// Écouter l'événement popstate pour gérer "précédent" et "suivant"
window.addEventListener('popstate', (event) => {
	console.log('popstate event:', event.state);
	
	// Si l'état correspond au jeu, on affiche le jeu
	if (event.state && event.state.page === 'game') {
		// Affiche le jeu et cache le menu
		menu.style.display = 'none';
		game.style.display = 'block';
		startPongGame();
	} else {
		// Dans le cas contraire, on considère que c'est le menu
		menu.style.display = 'block';
		game.style.display = 'none';
		stopPongGame();
	}
});

// function resizeCanvas() {
// 	// Obtenir la taille du conteneur en pixels
// 	const rect = game.getBoundingClientRect();
// 	canvas.width = rect.width;
// 	canvas.height = rect.height;
// 	// Tu pourras aussi recalculer tes valeurs de conversion (scale, etc.) ici, si nécessaire.
// }

// window.addEventListener('resize', resizeCanvas);
// // resizeCanvas(); // Appel initial
