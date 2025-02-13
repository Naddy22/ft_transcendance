import { startPongGame3D as startPongGame } from './game3D.js';
// import { stopPongGame3D as stopPongGame } from './game3D.js';
// Gestion de l'affichage entre le menu et le jeu
var startButton = document.getElementById('startButton');
var menu = document.getElementById('menu');
var game = document.getElementById('game');
// Définir l'état initial pour le menu
history.replaceState({ page: 'menu' }, 'Menu', '#menu');
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
        startPongGame();
    });
}
// Écouter l'événement popstate pour gérer "précédent" et "suivant"
window.addEventListener('popstate', function (event) {
    console.log('popstate event:', event.state);
    // Si l'état correspond au jeu, on affiche le jeu
    if (event.state && event.state.page === 'game') {
        // Affiche le jeu et cache le menu
        menu.style.display = 'none';
        game.style.display = 'block';
        startPongGame();
    }
    else {
        // Dans le cas contraire, on considère que c'est le menu
        menu.style.display = 'block';
        game.style.display = 'none';
        // stopPongGame();
    }
});
