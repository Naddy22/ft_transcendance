import { startPingPongGame } from './game.js';

// Gestion de l'affichage entre le menu et le jeu
document.getElementById('startButton').addEventListener('click', function() {
	// Cacher le menu
	document.getElementById('menu').style.display = 'none';
	// Afficher le jeu
	document.getElementById('game').style.display = 'block';

	// Manipulation de l'historique (ajouter un état pour le jeu)
	history.pushState({ page: 'game' }, 'Jeu', '#game');

	// Tu peux ici appeler la fonction pour démarrer ton jeu
	startPingPongGame();
});
