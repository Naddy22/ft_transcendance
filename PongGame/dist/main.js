import { startPingPongGame } from './game.js';
// Gestion de l'affichage entre le menu et le jeu
var startButton = document.getElementById('startButton');
var menu = document.getElementById('menu');
var game = document.getElementById('game');
// Vérification que l'élément startButton existe avant d'ajouter l'écouteur
if (startButton) {
    startButton.addEventListener('click', function () {
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
