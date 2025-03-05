import { startPongGame3D as startPongGame } from './game3D.js';
import { stopPongGame3D as stopPongGame } from './game3D.js';
import { Tournament } from './tournament3D.js';

// Gestion de l'affichage entre le menu et le jeu
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const homeButton = document.getElementById("homeButton") as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const menuButton = document.getElementById("menuButton") as HTMLButtonElement;
const menuDropdown = document.getElementById("menuDropdown") as HTMLElement;
const game = document.getElementById('game') as HTMLElement;
const endScreen = document.getElementById('endScreen') as HTMLElement;

const playVsAIButton = document.getElementById("playVsAI") as HTMLButtonElement;
const tournamentButton = document.getElementById('tournament') as HTMLElement;
const tournamentOptions = document.getElementById("tournamentOptions") as HTMLElement;
const tournament4 = document.getElementById("tournament4") as HTMLButtonElement;
const tournament8 = document.getElementById("tournament8") as HTMLButtonElement;

// // Création de l’écran de fin dynamiquement
// const endScreen = document.createElement('div');
// endScreen.id = 'endScreen';
// endScreen.innerHTML = `
// 	<h1 id="winnerMessage"></h1>
// 	<p id="currentMatchInfo"></p>
// 	<p id="nextMatchInfo"></p>
// 	<button id="replayButton">Rejouer</button>
// 	<button id="returnMenu">Retour au menu</button>
// 	<button id="nextMatchButton" style="display: none;">Match suivant</button>
// `;
// document.body.appendChild(endScreen);

const winnerMessage = document.getElementById('winnerMessage') as HTMLElement;
const currentMatchInfo = document.getElementById('currentMatchInfo') as HTMLElement;
const nextMatchInfo = document.getElementById('nextMatchInfo') as HTMLElement;
const replayButton = document.getElementById('replayButton') as HTMLButtonElement;
const returnMenuButton = document.getElementById('returnMenu') as HTMLButtonElement;
const nextMatchButton = document.getElementById('nextMatchButton') as HTMLButtonElement; // Nouvelle constante

const playerInputs = document.getElementById("playerInputs") as HTMLElement;
const inputsContainer = document.getElementById("inputsContainer") as HTMLElement;
const playersForm = document.getElementById("playersForm") as HTMLFormElement;

let playerNames: string[] = [];
// const playerNames = ["Joueur 1", "Joueur 2", "Joueur 3"]; // Liste dynamique plus tard
// const playerNames = ["Joueur 1", "Joueur 2"]; // Liste dynamique plus tard
let lastPlayers: string[] = [];
let isTournamentMode: boolean = false;
let currentTournament: Tournament | null = null;
let playerNumber: number = 0;

// Définir l'état initial pour le menu
history.replaceState({ page: 'menu' }, 'Menu', '#menu');

// Fonction pour afficher les champs de pseudos
function showPlayerInputs(players: number) {
	menu.style.display = 'none';
	tournamentOptions.style.display = "none";
	game.style.display = 'none';
	endScreen.style.display = 'none';
	inputsContainer.innerHTML = ""; // Réinitialiser

	for (let i = 1; i <= players; i++) {
		inputsContainer.innerHTML += `<input type="text" placeholder="Joueur ${i}" id="player${i}" required><br>`;
	}
	playerInputs.style.display = 'block'; // Afficher les inputs
	// // Ajoute l'état dans l'historique pour "Précédent"
	// history.replaceState({ page: "tournamentForm" }, "Saisie des joueurs", "#tournamentForm");
}

// Fonctions d’affichage
function showMenu(): void {
	menu.style.display = 'block';
	tournamentOptions.style.display = 'none';
	playerInputs.style.display = 'none';
	game.style.display = 'none';
	endScreen.style.display = 'none';
}

function showGame(): void {
	menu.style.display = 'none';
	tournamentOptions.style.display = 'none';
	playerInputs.style.display = 'none';
	game.style.display = 'block';
	endScreen.style.display = 'none';
}

// function showEndScreen(winner: string, isTournament: boolean = false, isFinal: boolean = false): void {
// 	winnerMessage.textContent = isFinal ? `${winner} a gagné le tournoi !` : `${winner} a gagné le match!`;
// 	menu.style.display = 'none';
// 	game.style.display = 'block';
// 	endScreen.style.display = 'block';
// 	replayButton.style.display = isTournament ? 'none' : 'block'; // Cache "Rejouer" en tournoi
// 	nextMatchButton.style.display = isTournament && !isFinal ? 'block' : 'none';
// }

function showEndScreen(winner: string, isTournament: boolean = false, isFinal: boolean = false): void {
	winnerMessage.textContent = isFinal ? `${winner} a gagné le tournoi !` : `${winner} a gagné le match !`;
	menu.style.display = 'none';
	tournamentOptions.style.display = 'none';
	playerInputs.style.display = 'none';
	game.style.display = 'block';
	endScreen.style.display = 'block';
	replayButton.style.display = isTournament ? 'none' : 'block'; // Cache "Rejouer" en tournoi
	nextMatchButton.style.display = isTournament && !isFinal ? 'block' : 'none';

	if (isTournament && currentTournament) {
		const currentMatch = currentTournament.getCurrentMatch();
		const nextMatch = currentTournament.getNextMatch();
		currentMatchInfo.textContent = currentMatch 
			? `Match suivant : ${currentMatch.player1} vs ${currentMatch.player2}` 
			: "";
		nextMatchInfo.textContent = nextMatch 
			? `Prochain match : ${nextMatch.player1} vs ${nextMatch.player2}` 
			: isFinal ? "Félicitation !" : "Préparation du prochain match...";
	} else {
		currentMatchInfo.textContent = "";
		nextMatchInfo.textContent = "";
	}
}

function showTournamentOption(): void {
	playerInputs.style.display = 'none';
	menu.style.display = 'none';
	game.style.display = 'none';
	endScreen.style.display = 'none';
	tournamentOptions.style.display = 'block'; // Afficher les choix 4 ou 8
}

// // a ajouté apres quand on fera menu deroulant
// document.querySelectorAll(".menu-dropdown a").forEach(link => {
// 	link.addEventListener("click", (event) => {
// 		event.preventDefault(); // Empêche le comportement par défaut des liens

// 		const action = (event.target as HTMLElement).getAttribute("data-action");

// 		if (action === "profile") {
// 			console.log("Ouvrir le profil");
// 			// Ajouter ici plus tard la logique pour ouvrir le profil
// 		} else if (action === "history") {
// 			console.log("Ouvrir l'historique");
// 			// Ajouter ici plus tard la logique pour les paramètres
// 		} else if (action === "statistics") {
// 			console.log("Ouvrir les statistiques");
// 			// Ajouter ici plus tard la logique pour déconnecter l'utilisateur
// 		}

// 		// Ferme le menu après un clic sur un bouton
// 		menuDropdown.classList.remove("active");
// 	});
// });

homeButton.addEventListener("click", () => {
	console.log("Retour au menu via bouton Maison");

	stopPongGame(); // Arrête le jeu s'il est en cours
	showMenu(); // Affiche le menu principal

	// Met à jour l'historique pour "Précédent/Suivant"
	history.pushState({ page: "menu" }, "Menu", "#menu");
});

menuButton.addEventListener("click", () => {
	menuDropdown.classList.toggle("active"); // Affiche/Cache le menu
});

// Vérification que l'élément startButton existe avant d'ajouter l'écouteur
if (startButton) {
	startButton.addEventListener('click', function() {
		playerNames = ["Joueur 1", "Joueur 2"];
		lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"
		showGame();

		// Manipulation de l'historique (ajouter un état pour le jeu)
		history.pushState({ page: 'game' }, 'Jeu', '#game');

		// if (playerNames.length === 4 || playerNames.length === 8) {
		// 	console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
		// 	isTournamentMode = true;
		// 	currentTournament = new Tournament(playerNames);
		// 	currentTournament.start((winner) => {
		// 		console.log("Match terminé, gagnant :", winner);
		// 		if (currentTournament && currentTournament.isTournamentOver()) {
		// 			console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
		// 			showEndScreen(winner, true, true);
		// 		} else {
		// 			showEndScreen(winner, true);
		// 		}
		// 	});

		// } else if (playerNames.length === 2) {
		if (playerNames.length === 2) {
			console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
			isTournamentMode = false;
			startPongGame(playerNames[0], playerNames[1], false, (winner) => {
				console.log("Match terminé, gagnant :", winner);
				showEndScreen(winner);
			// }, () => {
			// 	startButton.disabled = false; // Active une fois chargé
			});
		} else {
			alert("Pas assez de joueurs pour jouer !");
			showMenu();
		}
	});
}

playVsAIButton.addEventListener("click", () => {
	console.log("Démarrage du jeu contre l'IA");

	playerNames = ["Joueur 1", "IA"];
	lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"

	showGame();
	history.pushState({ page: 'game' }, 'Jeu', '#game');

	startPongGame(playerNames[0], playerNames[1], true, (winner) => {
		console.log("Match terminé, gagnant :", winner);
		showEndScreen(winner);
	});
});

// Quand on clique sur "Tournoi", afficher les options
tournamentButton.addEventListener("click", () => {
	showTournamentOption();
	history.pushState({ page: 'tournamentOption' }, 'Tournament', '#tournamentOption');
});

tournament4.addEventListener("click", () => {
	playerNumber = 4;
	showPlayerInputs(playerNumber);
	history.pushState({ page: 'tournamentForm' }, 'Saisie des joueurs', '#tournamentForm');
});
tournament8.addEventListener("click", () => {
	playerNumber = 8;
	showPlayerInputs(playerNumber);
	history.pushState({ page: 'tournamentForm' }, 'Saisie des joueurs', '#tournamentForm');
});

// Gérer le clic sur "lancer le tournoi"
playersForm.addEventListener("submit", (event) => {
	event.preventDefault(); // Empêche le rechargement de la page
	playerNames = [];
	for (let i = 1; i <= inputsContainer.children.length / 2; i++) {
		const input = document.getElementById(`player${i}`) as HTMLInputElement;
		playerNames.push(input.value.trim());
	}
	// Vérification des noms dupliqués
	const uniqueNames = new Set(playerNames); // Convertit la liste en "Set" (qui ne peut pas avoir de doublons)
	if (uniqueNames.size !== playerNames.length) {
		alert("Tous les pseudos doivent être uniques !");
		return;
	}
	console.log("Joueurs enregistrés :", playerNames);
	playerInputs.style.display = "none";
	showGame();

	// Manipulation de l'historique (ajouter un état pour le jeu)
	history.pushState({ page: 'game' }, 'Jeu', '#game');

	if (playerNames.length === 4 || playerNames.length === 8) {
		console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
		isTournamentMode = true;
		currentTournament = new Tournament(playerNames);
		currentTournament.start((winner) => {
			console.log("Match terminé, gagnant :", winner);
			if (currentTournament && currentTournament.isTournamentOver()) {
				console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
				showEndScreen(winner, true, true);
			} else {
				showEndScreen(winner, true);
			}
		});
	}
	
});

// if (tournamentButton) {
// 	tournamentButton.addEventListener('click', function() {
// 		showGame();

// 		// Manipulation de l'historique (ajouter un état pour le jeu)
// 		history.pushState({ page: 'game' }, 'Jeu', '#game');

// 		if (playerNames.length === 4 || playerNames.length === 8) {
// 			console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
// 			isTournamentMode = true;
// 			currentTournament = new Tournament(playerNames);
// 			currentTournament.start((winner) => {
// 				console.log("Match terminé, gagnant :", winner);
// 				if (currentTournament && currentTournament.isTournamentOver()) {
// 					console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
// 					showEndScreen(winner, true, true);
// 				} else {
// 					showEndScreen(winner, true);
// 				}
// 			});
// 		}
// 	});
// }

// Bouton "Rejouer"
replayButton.addEventListener('click', () => {
	stopPongGame();
	showGame();
	history.pushState({ page: 'game' }, 'Jeu', '#game');
	startPongGame(lastPlayers[0], lastPlayers[1], false, (winner) => {
		showEndScreen(winner);
	});
});

// Bouton "Retour au menu"
returnMenuButton.addEventListener('click', () => {
	stopPongGame();
	showMenu();
	history.pushState({ page: 'menu' }, 'Menu', '#menu');
});

nextMatchButton.addEventListener('click', () => {
	if (currentTournament) {
		showGame();
		history.pushState({ page: 'game' }, 'Jeu', '#game');
		currentTournament.nextMatch((winner) => {
			console.log("Match terminé, gagnant :", winner);
			if (currentTournament && currentTournament.isTournamentOver()) {
				console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
				showEndScreen(winner, true, true);
			} else {
				showEndScreen(winner, true);
			}
		});
	}
	else
		return ;
});

// Écouter l'événement popstate pour gérer "précédent" et "suivant"
window.addEventListener("popstate", (event) => {
	console.log("popstate event:", event.state);

	// Masquer tous les écrans au début pour éviter qu'un mauvais reste affiché
	menu.style.display = "none";
	game.style.display = "none";
	endScreen.style.display = "none";
	tournamentOptions.style.display = "none";
	playerInputs.style.display = "none";
	
	// 🔹 Vérification si `event.state` est valide
	if (!event.state || !event.state.page) {
		console.log("Aucun état trouvé, retour au menu par défaut.");
		showMenu();
		return;
	}

	switch (event.state.page) {
		case "game":
			console.log("Reprise du jeu via popstate");
			lastPlayers = playerNames.slice();
			showGame();

			if (isTournamentMode) {
				console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
				isTournamentMode = true;
				currentTournament = new Tournament(playerNames);
				currentTournament.start((winner) => {
				console.log("Match terminé, gagnant :", winner);
				if (currentTournament && currentTournament.isTournamentOver()) {
					console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
					showEndScreen(winner, true, true);
				} else {
					showEndScreen(winner, true);
				}
			});
			} else {
				if (playerNames.length === 2) {
					console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
					isTournamentMode = false;
					startPongGame(playerNames[0], playerNames[1], false, (winner) => {
						console.log("Match terminé, gagnant :", winner);
						showEndScreen(winner);
					});
				} else {
					alert("Pas assez de joueurs pour jouer !");
					showMenu();
				}
			}
			break;

		case "menu":
			console.log("Retour au menu via popstate");
			stopPongGame();
			showMenu();
			currentTournament = null;
			break;

		case "tournamentOption":
			console.log("Retour à la sélection du tournoi");
			showTournamentOption();
			break;

		case "tournamentForm":
			stopPongGame();
			console.log("Retour à la configuration du tournoi");
			showPlayerInputs(playerNumber);
			break;

		default:
			console.log("État inconnu, retour au menu.");
			showMenu();
	}
});


// window.addEventListener('popstate', (event) => {
// 	console.log('popstate event:', event.state);
	
// 	// Si l'état correspond au jeu, on affiche le jeu
// 	if (event.state && event.state.page === 'game') {
// 		console.log("Relance du jeu via popstate");
// 		lastPlayers = playerNames.slice();
// 		// Affiche le jeu et cache le menu
// 		showGame();
// 		if (playerNames.length === 4 || playerNames.length === 8) {
// 			console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
// 			isTournamentMode = true;
// 			currentTournament = new Tournament(playerNames); // Toujours recréer pour cohérence
// 			currentTournament.start((winner) => {
// 				console.log("Match terminé, gagnant :", winner);
// 				if (currentTournament && currentTournament.isTournamentOver()) {
// 					console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
// 					showEndScreen(winner, true, true);
// 				} else {
// 					showEndScreen(winner, true);
// 				}
// 			});
// 		} else if (playerNames.length === 2) {
// 			console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
// 			isTournamentMode = false;
// 			startPongGame(playerNames[0], playerNames[1], (winner) => {
// 				console.log("Match terminé, gagnant :", winner);
// 				showEndScreen(winner);
// 			});
// 		} else {
// 			alert("Pas assez de joueurs pour jouer !");
// 			showMenu();
// 		}
// 	} else {
// 		console.log("Arrêt du jeu via popstate");
// 		stopPongGame();
// 		showMenu();
// 		currentTournament = null;
// 	}
// });

// function resizeCanvas() {
// 	// Obtenir la taille du conteneur en pixels
// 	const rect = game.getBoundingClientRect();
// 	canvas.width = rect.width;
// 	canvas.height = rect.height;
// 	// Tu pourras aussi recalculer tes valeurs de conversion (scale, etc.) ici, si nécessaire.
// }

// window.addEventListener('resize', resizeCanvas);
// // resizeCanvas(); // Appel initial
