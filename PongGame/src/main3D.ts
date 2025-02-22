import { startPongGame3D as startPongGame } from './game3D.js';
import { stopPongGame3D as stopPongGame } from './game3D.js';
import { Tournament } from './tournament3D.js';

// Gestion de l'affichage entre le menu et le jeu
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const game = document.getElementById('game') as HTMLElement;

// Création de l’écran de fin dynamiquement
const endScreen = document.createElement('div');
endScreen.id = 'endScreen';
endScreen.innerHTML = `
	<h1 id="winnerMessage"></h1>
	<button id="replayButton">Rejouer</button>
	<button id="returnMenu">Retour au menu</button>
`;
document.body.appendChild(endScreen);

const winnerMessage = document.getElementById('winnerMessage') as HTMLElement;
const replayButton = document.getElementById('replayButton') as HTMLButtonElement;
const returnMenuButton = document.getElementById('returnMenu') as HTMLButtonElement;

const playerNames = ["Joueur 1", "Joueur 2", "Joueur 3", "Joueur 4"]; // Liste dynamique plus tard
// const playerNames = ["Joueur 1", "Joueur 2", "Joueur 3"]; // Liste dynamique plus tard
// const playerNames = ["Joueur 1", "Joueur 2"]; // Liste dynamique plus tard
let lastPlayers: string[] = [];
let isTournamentMode = false;

// Définir l'état initial pour le menu
history.replaceState({ page: 'menu' }, 'Menu', '#menu');

// Fonctions d’affichage
function showMenu(): void {
	menu.style.display = 'block';
	game.style.display = 'none';
	endScreen.style.display = 'none';
}

function showGame(): void {
	menu.style.display = 'none';
	game.style.display = 'block';
	endScreen.style.display = 'none';
}

function showEndScreen(winner: string, isTournament: boolean = false): void {
	winnerMessage.textContent = isTournament ? `${winner} a gagné le tournoi !` : `${winner} a gagné le match!`;
	menu.style.display = 'none';
	game.style.display = 'block';
	endScreen.style.display = 'block';
	replayButton.style.display = isTournament ? 'none' : 'block'; // Cache "Rejouer" en tournoi
}

// Vérification que l'élément startButton existe avant d'ajouter l'écouteur
if (startButton) {
	startButton.addEventListener('click', function() {
		lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"
		showGame();

		// Manipulation de l'historique (ajouter un état pour le jeu)
		history.pushState({ page: 'game' }, 'Jeu', '#game');

		// Démarrer le jeu
		if (playerNames.length === 4 || playerNames.length === 8) {
			console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
			isTournamentMode = true;
			const tournament = new Tournament(playerNames);
			tournament.start((winner) => {
				console.log("Match terminé, gagnant :", winner);
				if (tournament.isTournamentOver()) {
					console.log("Tournoi terminé ! Champion :", tournament.getWinner());
					showEndScreen(winner, true);
				}
			});
		} else if (playerNames.length === 2) {
			console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
			isTournamentMode = false;
			startPongGame(playerNames[0], playerNames[1], (winner) => {
				console.log("Match terminé, gagnant :", winner);
				showEndScreen(winner);
			});
		} else {
			alert("Pas assez de joueurs pour jouer !");
			showMenu();
		}
	});
}

// Bouton "Rejouer"
replayButton.addEventListener('click', () => {
	stopPongGame();
	showGame();
	history.pushState({ page: 'game' }, 'Jeu', '#game');
	startPongGame(lastPlayers[0], lastPlayers[1], (winner) => {
		showEndScreen(winner);
	});
});

// Bouton "Retour au menu"
returnMenuButton.addEventListener('click', () => {
	stopPongGame();
	showMenu();
	history.pushState({ page: 'menu' }, 'Menu', '#menu');
});

// Écouter l'événement popstate pour gérer "précédent" et "suivant"
window.addEventListener('popstate', (event) => {
	console.log('popstate event:', event.state);
	
	// Si l'état correspond au jeu, on affiche le jeu
	if (event.state && event.state.page === 'game') {
		// Affiche le jeu et cache le menu
		showGame();
		if (playerNames.length === 4 || playerNames.length === 8) {
			console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
			isTournamentMode = true;
			const tournament = new Tournament(playerNames);
			tournament.start((winner) => {
				console.log("Match terminé, gagnant :", winner);
				if (tournament.isTournamentOver()) {
					console.log("Tournoi terminé ! Champion :", tournament.getWinner());
					showEndScreen(winner, true);
				}
			});
		} else if (playerNames.length === 2) {
			console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
			isTournamentMode = false;
			startPongGame(playerNames[0], playerNames[1], (winner) => {
				console.log("Match terminé, gagnant :", winner);
				showEndScreen(winner);
			});
		} else {
			alert("Pas assez de joueurs pour jouer !");
			showMenu();
		}
	} else {
		stopPongGame();
		showMenu();
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
