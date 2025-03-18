import { loadLanguage, applyTranslations } from "./language";
import { startPongGame3D as startPongGame } from './game3D';
import { stopPongGame3D as stopPongGame } from './game3D';
import { Tournament } from './tournament3D';
import { addGameToHistory, updateHistoryUI } from "./history";
import { addGameToStats, updateStatsUI } from "./stats";
import { checkSession, registerUser, loginUser, logoutUser } from "./auth";
import { getCompleteProfile, updateUserProfile, updatePassword, uploadAvatar, searchUsers, addFriend, removeFriend, deleteUserAccount, exportUserData, anonymizeUser} from "./profile";

const languageSelect = document.getElementById("languageSelect") as HTMLSelectElement;
const homeButton = document.getElementById("homeButton") as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const menuButton = document.getElementById("menuButton") as HTMLButtonElement;
const menuDropdown = document.getElementById("menuDropdown") as HTMLElement;

// Gestion et affichage du bouton auth
const authButton = document.getElementById("authButton") as HTMLElement;
const authPage = document.getElementById("authPage") as HTMLElement;
const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const registerForm = document.getElementById("registerForm") as HTMLFormElement;
const loginMessage = document.getElementById("loginMessage") as HTMLParagraphElement;
const registerMessage = document.getElementById("registerMessage") as HTMLParagraphElement;

const profileModal = document.getElementById("profileModal") as HTMLElement;
const profileForm = document.getElementById("profileForm") as HTMLFormElement;
const profileMessage = document.getElementById("profileMessage") as HTMLParagraphElement;
const avatarInput = document.getElementById("avatarInput")! as HTMLInputElement;
const uploadAvatarBtn = document.getElementById("uploadAvatarBtn") as HTMLButtonElement;
const friendList = document.getElementById("friendList") as HTMLUListElement;
const friendSearchBtn = document.getElementById("friendSearchBtn") as HTMLButtonElement;

const historyModal = document.getElementById("historyModal") as HTMLElement;
const statsModal = document.getElementById("statsModal") as HTMLElement;
const howToPlayModal = document.getElementById("howToPlayModal") as HTMLElement;

const privacyModal = document.getElementById("privacyModal") as HTMLElement;
const exportDataBtn = document.getElementById("exportDataBtn") as HTMLButtonElement;
const anonymizeBtn = document.getElementById("anonymizeBtn") as HTMLButtonElement;
const deleteAccountBtn = document.getElementById("deleteAccountBtn") as HTMLButtonElement;

const closeButton = document.querySelectorAll(".close");

const playVsGuest = document.getElementById('playVsGuest') as HTMLButtonElement;
const game = document.getElementById('game') as HTMLElement;
const endScreen = document.getElementById('endScreen') as HTMLElement;

const playVsAIButton = document.getElementById("playVsAI") as HTMLButtonElement;
const tournamentButton = document.getElementById('tournament') as HTMLButtonElement;
const tournamentOptions = document.getElementById("tournamentOptions") as HTMLElement;
const tournament4 = document.getElementById("tournament4") as HTMLButtonElement;
const tournament8 = document.getElementById("tournament8") as HTMLButtonElement;

const winnerMessage = document.getElementById('winnerMessage') as HTMLElement;
const currentMatchInfo = document.getElementById('currentMatchInfo') as HTMLElement;
const nextMatchInfo = document.getElementById('nextMatchInfo') as HTMLElement;
const replayButton = document.getElementById('replayButton') as HTMLButtonElement;
const returnMenuButton = document.getElementById('returnMenu') as HTMLButtonElement;
const nextMatchButton = document.getElementById('nextMatchButton') as HTMLButtonElement; // Nouvelle constante

const playerInputs = document.getElementById("playerInputs") as HTMLElement;
const inputsContainer = document.getElementById("inputsContainer") as HTMLElement;
const playersForm = document.getElementById("playersForm") as HTMLFormElement;

let currentUser: { id: number; username: string; email: string } | null = null;
let playerNames: string[] = [];
let lastPlayers: string[] = [];
let isTournamentMode: boolean = false;
let isVsAIMode: boolean = false; // Par défaut, pas en mode IA
let currentTournament: Tournament | null = null;
let playerNumber: number = 0;

// Définir l'état initial pour le menu
history.replaceState({ page: 'menu' }, 'Menu', '#menu');

// 📌 Charge la langue sauvegardée au démarrage
document.addEventListener("DOMContentLoaded", () => {
	const savedLanguage = localStorage.getItem("language") || "fr";
	languageSelect.value = savedLanguage;
	loadLanguage(savedLanguage).then(translations => applyTranslations(translations));
});

// 📌 Met à jour les traductions quand la langue change
languageSelect.addEventListener("change", () => {
	const selectedLanguage = languageSelect.value;
	loadLanguage(selectedLanguage).then(translations => applyTranslations(translations));
});

// 🔹 Vérifie si l'utilisateur est connecté au chargement de la page
function updateAuthButton() {
	console.log("update auth");
	const logoutButton = document.getElementById("logoutButton") as HTMLElement;

	checkSession().then((user) => {
		currentUser = user;
		if (currentUser) {
			console.log("✅ Session active :", currentUser.username);
			logoutButton.style.display = "block"; // Affiche le bouton Déconnexion dans le menu
			authButton.style.display = "none"; // Cache le bouton Connexion / Inscription
		
			menuButton.style.display = "block";
			menuButton.style.paddingTop = "10px"; // Ajuste si le texte est trop bas
			homeButton.style.visibility = "visible";
			playVsGuest.style.display = "block";
			playVsAIButton.style.display = "block";
			tournamentButton.style.display = "block";
		} else {
			console.log("❌ Aucun utilisateur connecté.");
			logoutButton.style.display = "none";
			authButton.style.display = "block";

			menuButton.style.display = "none";
			homeButton.style.visibility = "hidden";
			playVsGuest.style.display = "none";
			playVsAIButton.style.display = "none";
			tournamentButton.style.display = "none";
		}
	});
}

// Afficher la page d'authentification
authButton.addEventListener("click", () => {
	showAuthPage();
	history.pushState({ page: "auth" }, "Authentification", "#auth");
});


// Inscription
registerForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const username = (document.getElementById("regUsername") as HTMLInputElement).value;
	const email = (document.getElementById("regEmail") as HTMLInputElement).value;
	const password = (document.getElementById("regPassword") as HTMLInputElement).value;

	try {
		const message = await registerUser(username, email, password);
		registerMessage.style.color = "green";
		registerMessage.textContent =  message;
	} catch (error: any) {
		registerMessage.style.color = "red";
		registerMessage.textContent = error.message; // Affiche l'erreur sous le formulaire
	}
});

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const identifier = (document.getElementById("loginIdentifier") as HTMLInputElement).value;
	const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

	try {
		await loginUser(identifier, password);
		authPage.style.display = "none";
		showMenu();
		updateAuthButton();
		history.pushState({ page: "menu" }, "Menu", "#menu");
	} catch (error: any) {
		loginMessage.style.color = "red"; // ❌ Change la couleur en rouge
		loginMessage.textContent = error.message; // Affiche l'erreur sous le formulaire
	}
});

// 🌟 Met à jour le bouton d'auth au chargement
document.addEventListener("DOMContentLoaded", () => {
	updateAuthButton();
});

// Fonction pour afficher les champs de pseudos
function showPlayerInputs(players: number) {
	menu.style.display = 'none';
	authPage.style.display = "none";
	tournamentOptions.style.display = "none";
	game.style.display = 'none';
	endScreen.style.display = 'none';
	inputsContainer.innerHTML = ""; // Réinitialiser

	// Premier champ avec le pseudo de l'utilisateur connecté
	inputsContainer.innerHTML += `<input type="text" value="${currentUser?.username}" id="player1"><br>`;

	for (let i = 2; i <= players; i++) {
		inputsContainer.innerHTML += `<input type="text" placeholder="Joueur ${i}" id="player${i}" required><br>`;
	}
	playerInputs.style.display = 'block'; // Afficher les inputs
}

// Fonctions d’affichage
function showMenu(): void {
	menu.style.display = 'block';
	authPage.style.display = "none";
	tournamentOptions.style.display = 'none';
	playerInputs.style.display = 'none';
	game.style.display = 'none';
	endScreen.style.display = 'none';
}

function showAuthPage(): void {
	(document.getElementById("loginForm") as HTMLFormElement).reset();
	(document.getElementById("registerForm") as HTMLFormElement).reset();
	menu.style.display = 'none';
	tournamentOptions.style.display = "none";
	game.style.display = 'none';
	endScreen.style.display = 'none';
	playerInputs.style.display = 'none';
	authPage.style.display = "block";
	loginMessage.textContent = "";  // Réinitialise le message d'erreur du login
	registerMessage.textContent = "";  // Réinitialise le message d'erreur de l'inscription
}

function showGame(): void {
	menu.style.display = 'none';
	authPage.style.display = "none";
	tournamentOptions.style.display = 'none';
	playerInputs.style.display = 'none';
	game.style.display = 'block';
	endScreen.style.display = 'none';
}

function showEndScreen(winner: string, isTournament: boolean = false, isFinal: boolean = false): void {
	winnerMessage.textContent = isFinal ? `${winner} a gagné le tournoi !` : `${winner} a gagné le match !`;
	menu.style.display = 'none';
	authPage.style.display = "none";
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
	authPage.style.display = "none";
	game.style.display = 'none';
	endScreen.style.display = 'none';
	tournamentOptions.style.display = 'block'; // Afficher les choix 4 ou 8
}

window.addEventListener("click", function(event) {
	console.log("🌍 Clic global détecté, target :", event.target);
	if (!menuDropdown.contains(event.target as Node) && !menuButton.contains(event.target as Node)) {
		menuDropdown.classList.remove("active");
	}
	if (profileModal && event.target === profileModal) {
		profileModal.style.display = "none";
	}
	if (historyModal && event.target === historyModal) {
		historyModal.style.display = "none";
	}
	if (statsModal && event.target === statsModal) {
		statsModal.style.display = "none";
	}
	if (howToPlayModal && event.target === howToPlayModal) {
		howToPlayModal.style.display = "none";
	}
	if (privacyModal && event.target === privacyModal) {
		privacyModal.style.display = "none";
	}
});

homeButton.addEventListener("click", () => {
	console.log("Retour au menu via bouton Maison");

	stopPongGame(); // Arrête le jeu s'il est en cours
	showMenu(); // Affiche le menu principal

	// Met à jour l'historique pour "Précédent/Suivant"
	history.pushState({ page: "menu" }, "Menu", "#menu");
});

// 📌 Charger le profil utilisateur + amis
function loadUserProfile() {
	getCompleteProfile(currentUser!.id)
		.then(({ profile, friends }) => {
			console.log("✅ Profil chargé :", profile);
			console.log("✅ Amis chargés :", friends);

			(document.getElementById("newUsername")! as HTMLInputElement).value = profile.username;
			(document.getElementById("newEmail")! as HTMLInputElement).value = profile.email;
			(document.getElementById("userAvatar")! as HTMLImageElement).src = profile.avatar;
			(document.getElementById("oldPassword")! as HTMLInputElement).value = "";
			(document.getElementById("newPassword")! as HTMLInputElement).value = "";
			(document.getElementById("friendSearchInput")! as HTMLInputElement).value = "";
			(document.getElementById("friendSearchResults")!).innerHTML = ""; // ✅ Efface les résultats de recherche

			updateFriendsUI(friends);
		})
		.catch(error => {
			console.error("❌ Erreur chargement profil :", error.message);
			alert("Erreur lors du chargement du profil.");
		});
}

// 📌 Mettre à jour le profil
profileForm.addEventListener("submit", (event) => {
	event.preventDefault();

	// Vérifier quel bouton a été cliqué
	const clickedButton = event.submitter as HTMLButtonElement;
	if (clickedButton.id !== "saveChangesBtn") return; // 🔥 Vérifie si c'est "Sauvegarder"

	const updatedData = {
		username: (document.getElementById("newUsername")! as HTMLInputElement).value.trim(),
		email: (document.getElementById("newEmail")! as HTMLInputElement).value.trim(),
	};

	const oldPassword = (document.getElementById("oldPassword")! as HTMLInputElement).value.trim();
	const newPassword = (document.getElementById("newPassword")! as HTMLInputElement).value.trim();

	Promise.all([
		updateUserProfile(currentUser!.id, updatedData),
		newPassword ? updatePassword(currentUser!.id, oldPassword, newPassword) : Promise.resolve()
	])
	.then(messages => {
		profileMessage.style.color = "green";
		profileMessage.textContent = messages.join("\n");
		loadUserProfile(); // Recharge après modification

		setTimeout(() => {
			profileMessage.style.opacity = "0";
		}, 10000);
	})
	.catch(error => {
		profileMessage.style.color = "red";
		profileMessage.textContent = `❌ Erreur : ${error.message}`;

		// 🔹 Supprime le message après 5 secondes
		setTimeout(() => {
			profileMessage.style.opacity = "0";
		}, 10000);
	});
	// 🔹 Montre le message immédiatement
	profileMessage.style.opacity = "1";
});

// 📌 Changer l'avatar
uploadAvatarBtn.addEventListener("click", () => {
	if (!currentUser!.id || !avatarInput.files || avatarInput.files.length === 0) return;

	uploadAvatar(currentUser!.id, avatarInput.files[0])
		.then(newAvatarUrl => {
			(document.getElementById("userAvatar")! as HTMLImageElement).src = newAvatarUrl;
			alert("✅ Avatar mis à jour !");
		})
		.catch(error => alert(`❌ Erreur : ${error.message}`));
});

// 📌 Mettre à jour l'affichage des amis
function updateFriendsUI(friends: { id: number; username: string; status: string }[]) {
	friendList.innerHTML = "";
	if (friends.length === 0) {
		friendList.innerHTML = "<li>Aucun ami pour le moment.</li>";
		return;
	}

	friends.forEach(friend => {
		const li = document.createElement("li");
		li.textContent = `${friend.username} (${friend.status})`;
		li.id = `friend-${friend.id}`;

		const removeBtn = document.createElement("button");
		removeBtn.textContent = "❌";
		removeBtn.addEventListener("click", () => removeFriendUI(friend.id));

		li.appendChild(removeBtn);
		friendList.appendChild(li);
	});
}

friendSearchBtn.addEventListener("click", () => {
	const query = (document.getElementById("friendSearchInput")! as HTMLInputElement).value.trim();
	const friendSearchResults = document.getElementById("friendSearchResults")!;

	if (!query) {
		alert("❌ Veuillez entrer un nom ou un email pour la recherche.");
		return;
	}

	searchUsers(query)
		.then(results => {
			friendSearchResults.innerHTML = ""; // Vide la liste précédente

			if (results.length === 0) {
				friendSearchResults.innerHTML = "<li>Aucun utilisateur trouvé.</li>";
				return;
			}

			results.forEach(user => {
				const listItem = document.createElement("li");
			
				// 🔹 Crée un élément pour le texte (pseudo + email)
				const userText = document.createElement("span");
				userText.textContent = `${user.username} (${user.email}) (${user.status})`;
			
				// 🔹 Crée le bouton "Ajouter"
				const addBtn = document.createElement("button");
				addBtn.textContent = "Ajouter";
				addBtn.addEventListener("click", () => addFriendUI(user.id));
			
				// 🔹 Ajoute le texte et le bouton dans la ligne
				listItem.appendChild(userText);
				listItem.appendChild(addBtn);
			
				friendSearchResults.appendChild(listItem);
			});
			
		})
		.catch(error => {
			friendSearchResults.innerHTML = `<li>❌ Erreur : ${error.message}</li>`;
		});
});



function addFriendUI(friendId: number) {
	addFriend(currentUser!.id, friendId)
		.then(message => {
			// alert(message);
			loadUserProfile(); // Recharge la liste d'amis après ajout
		})
		.catch(error => alert(`❌ Erreur : ${error.message}`));
}

// 📌 Supprimer un ami
function removeFriendUI(friendId: number) {
	removeFriend(currentUser!.id, friendId)
		.then(message => {
			// alert(message);
			document.getElementById(`friend-${friendId}`)?.remove();
		})
		.catch(error => alert(`❌ Erreur : ${error.message}`));
}

// 📥 Télécharger les données
document.getElementById("exportDataBtn")!.addEventListener("click", () => {
	exportUserData(currentUser!.id)
		.then(blob => {
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `user_data_${currentUser!.id}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			document.getElementById("exportMessage")!.textContent = "✅ Données téléchargées avec succès.";

			setTimeout(() => {
				document.getElementById("exportMessage")!.style.display = "none";
			}, 10000);
		})
		.catch(error => {
			document.getElementById("exportMessage")!.textContent = `❌ Erreur : ${error.message}`;
			setTimeout(() => {
				document.getElementById("exportMessage")!.style.display = "none";
			}, 10000);
		});
		document.getElementById("exportMessage")!.style.display = "block";
});

// 🕵️‍♂️ Anonymiser le compte
document.getElementById("anonymizeBtn")!.addEventListener("click", () => {
	anonymizeUser(currentUser!.id)
		.then(message => {
			document.getElementById("anonymizeMessage")!.textContent = message;
			setTimeout(() => {
				document.getElementById("anonymizeMessage")!.style.display = "none";
			}, 10000);
		})
		.catch(error => {
			document.getElementById("anonymizeMessage")!.textContent = `❌ Erreur : ${error.message}`;
			setTimeout(() => {
				document.getElementById("anonymizeMessage")!.style.display = "none";
			}, 10000);
		});
		document.getElementById("anonymizeMessage")!.style.display = "block";
});

// 📌 Supprimer son compte
deleteAccountBtn.addEventListener("click", () => {
	if (!currentUser!.id || !confirm("⚠️ Es-tu sûr de vouloir supprimer ton compte ?")) return;

	deleteUserAccount(currentUser!.id)
		.then(message => {
			alert(message);
			window.location.reload();
		})
		.catch(error => {
		document.getElementById("deleteMessage")!.textContent = `❌ Erreur : ${error.message}`;
		});
});

menuButton.addEventListener("click", () => {
	menuDropdown.classList.toggle("active"); // Affiche/Cache le menu
});

if (menuDropdown) {
	menuDropdown.addEventListener("click", function(event) {
		const target = event.target as HTMLElement;
		if (target.dataset.action === "profile" && profileModal) {
			event.preventDefault();
			loadUserProfile();
			profileModal.style.display = "flex";
		}
		if (target.dataset.action === "history" && historyModal) {
			event.preventDefault();
			updateHistoryUI(currentUser!.id); // Mets à jour l'historique
			historyModal.style.display = "flex";
		}
		if (target.dataset.action === "howToPlay" && howToPlayModal) {
			event.preventDefault();
			howToPlayModal.style.display = "flex";
		}
		if (target.dataset.action === "statistics" && statsModal) {
			event.preventDefault();
			updateStatsUI(currentUser!.id); // Met à jour les nombres
			// renderStatsChart(); // Génère le graphique
			statsModal.style.display = "flex";
		}
		if (target.dataset.action === "privacyData" && privacyModal) {
			event.preventDefault();
			privacyModal.style.display = "flex";
		}
		if (target.id === "logoutButton") {
			event.preventDefault();
			logoutUser().then(() => {
				updateAuthButton(); // Met à jour l'affichage des boutons
		
				// 🔄 Ajoute un nouvel état propre après la déconnexion
				history.pushState({ page: "menu" }, "Menu", "#menu");
		
				console.log("🔄 Historique mis à jour : ", history.state, "URL actuelle : ", window.location.hash);
		
				showMenu(); // Affiche le menu
				console.log("📺 Après showMenu");
			});
		}
		menuDropdown.classList.remove("active");
		console.log("🔽 Menu déroulant fermé");
	});
}

if (closeButton) {
	closeButton.forEach((button) => {
		button.addEventListener("click", () => {
			// Trouver la modale parente de ce bouton
			const modal = button.closest(".modal") as HTMLElement;
			if (modal) {
				modal.style.display = "none";
			}
		});
	});
}

// Vérification que l'élément startButton existe avant d'ajouter l'écouteur
if (playVsGuest) {
	playVsGuest.addEventListener('click', function() {
		playerNames = [currentUser!.username, "Joueur 2"];
		lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"
		showGame();

		// Manipulation de l'historique (ajouter un état pour le jeu)
		history.pushState({ page: 'game', isVsAI: false, isTournament: false, playerNames: [...playerNames] }, 'Jeu', '#game');

		if (playerNames.length === 2) {
			console.log("Match simple entre", playerNames[0], "et", playerNames[1]);
			isTournamentMode = false;
			isVsAIMode = false;
			startPongGame(playerNames[0], playerNames[1], false, (winner) => {
				console.log("Match terminé, gagnant :", winner);

				// Déterminer le résultat
				let result = winner === playerNames[0] ? "✅ Victoire" : "❌ Défaite";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
				addGameToStats(currentUser!.id, winner === playerNames[0] ? "Victoire" : "Défaite");
				showEndScreen(winner);
			});
		} else {
			alert("Pas assez de joueurs pour jouer !");
			showMenu();
		}
	});
}

playVsAIButton.addEventListener("click", () => {
	console.log("Démarrage du jeu contre l'IA");
	isTournamentMode = false;
	isVsAIMode = true;

	playerNames = [currentUser!.username, "IA"];
	lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"

	showGame();
	history.pushState({ page: 'game', isVsAI: true, isTournament: false, playerNames: [...playerNames]}, 'Jeu', '#game');

	startPongGame(playerNames[0], playerNames[1], true, (winner) => {
		console.log("Match terminé, gagnant :", winner);

		// Déterminer le résultat
		let result = winner === playerNames[0] ? "✅ Victoire" : "❌ Défaite";
		// Ajouter à l’historique
		addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
		addGameToStats(currentUser!.id, winner === playerNames[0] ? "Victoire" : "Défaite");
		showEndScreen(winner);
	});
});

// Quand on clique sur "Tournoi", afficher les options
tournamentButton.addEventListener("click", () => {
	if (!currentUser) {
		alert("Vous devez vous connecter");
		return ;
	}
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
	history.pushState({ page: 'game', isVsAI: false, isTournament: true, playerNames: [...playerNames]}, 'Jeu', '#game');

	if (playerNames.length === 4 || playerNames.length === 8) {
		console.log("Lancement d’un tournoi avec", playerNames.length, "joueurs");
		isTournamentMode = true;
		isVsAIMode = false;
		currentTournament = new Tournament(playerNames);
		currentTournament.start((winner) => {
			console.log("Match terminé, gagnant :", winner);
			if (currentTournament && currentTournament.isTournamentOver()) {
				console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
				// Déterminer le résultat
				let result = winner === playerNames[0] ? "✅ Victoire" : "❌ Défaite";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
				addGameToStats(currentUser!.id, winner === playerNames[0] ? "Victoire" : "Défaite");
				showEndScreen(winner, true, true);
			} else {
				showEndScreen(winner, true);
			}
		});
	}
	
});

// Bouton "Rejouer"
replayButton.addEventListener('click', () => {
	stopPongGame();
	showGame();
	history.pushState({ page: 'game', isVsAI: isVsAIMode, isTournament: false, playerNames: [...playerNames]}, 'Jeu', '#game');
	startPongGame(lastPlayers[0], lastPlayers[1], isVsAIMode, (winner) => {
		console.log("Match terminé, gagnant :", winner);
		// Déterminer le résultat
		let result = winner === lastPlayers[0] ? "✅ Victoire" : "❌ Défaite";
		// Ajouter à l’historique
		addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
		addGameToStats(currentUser!.id, winner === lastPlayers[0] ? "Victoire" : "Défaite");
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
		history.pushState({ page: 'game', isVsAI: false, isTournament: true, playerNames: [...playerNames]}, 'Jeu', '#game');
		currentTournament.nextMatch((winner) => {
			console.log("Match terminé, gagnant :", winner);
			if (currentTournament && currentTournament.isTournamentOver()) {
				console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
				// Déterminer le résultat
				let result = winner === playerNames[0] ? "✅ Victoire" : "❌ Défaite";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
				addGameToStats(currentUser!.id, winner === playerNames[0] ? "Victoire" : "Défaite");
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
		history.replaceState({ page: "menu" }, "Menu", "#menu");
		return;
	}

	let lastGameWasVsAI = event.state.isVsAI; 
	let lastGameWasTournament = event.state.isTournament;
	let StatePlayerNames = event.state.playerNames || [];

	switch (event.state.page) {
		case "menu":
			console.log("Retour au menu via popstate");
			stopPongGame();
			showMenu();
			currentTournament = null;
			break;
		
		case "auth":
			console.log("Retour au auth via popstate");
			showAuthPage();
			break;

		case "game":
			console.log("Reprise du jeu via popstate");
			lastPlayers = playerNames.slice();
			showGame();

			if (lastGameWasVsAI) {
				console.log("Démarrage du jeu via state contre l'IA");
				isTournamentMode = false;
				isVsAIMode = true;

				lastPlayers = StatePlayerNames.slice(); // Sauvegarde pour "Rejouer"

				startPongGame(StatePlayerNames[0], StatePlayerNames[1], true, (winner) => {
					console.log("Match terminé, gagnant :", winner);
					// Déterminer le résultat
					let result = winner === StatePlayerNames[0] ? "✅ Victoire" : "❌ Défaite";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
					addGameToStats(currentUser!.id, winner === StatePlayerNames[0] ? "Victoire" : "Défaite");
					showEndScreen(winner);
				});
			}
			else if (lastGameWasTournament) {
				console.log("Lancement d’un tournoi via state avec", playerNames.length, "joueurs");
				isTournamentMode = true;
				isVsAIMode = false;
				currentTournament = new Tournament(StatePlayerNames);
				currentTournament.start((winner) => {
				console.log("Match terminé, gagnant :", winner);
				if (currentTournament && currentTournament.isTournamentOver()) {
					console.log("Tournoi terminé ! Champion :", currentTournament.getWinner());
					// Déterminer le résultat
					let result = winner === StatePlayerNames[0] ? "✅ Victoire" : "❌ Défaite";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
					addGameToStats(currentUser!.id, winner === StatePlayerNames[0] ? "Victoire" : "Défaite");
					showEndScreen(winner, true, true);
				} else {
					showEndScreen(winner, true);
				}
			});
			} else {
				lastPlayers = StatePlayerNames.slice(); // Sauvegarde pour "Rejouer"

				console.log("Match simple via state entre", StatePlayerNames[0], "et", StatePlayerNames[1]);
				isTournamentMode = false;
				isVsAIMode = false;

				startPongGame(StatePlayerNames[0], StatePlayerNames[1], false, (winner) => {
					console.log("Match terminé, gagnant :", winner);
					// Déterminer le résultat
					let result = winner === StatePlayerNames[0] ? "✅ Victoire" : "❌ Défaite";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "Tournament" : isVsAIMode ? "vs AI" : "1vs1", result);
					addGameToStats(currentUser!.id, winner === StatePlayerNames[0] ? "Victoire" : "Défaite");
					showEndScreen(winner);
				});
			}
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

// function resizeCanvas() {
// 	// Obtenir la taille du conteneur en pixels
// 	const rect = game.getBoundingClientRect();
// 	canvas.width = rect.width;
// 	canvas.height = rect.height;
// 	// Tu pourras aussi recalculer tes valeurs de conversion (scale, etc.) ici, si nécessaire.
// }

// window.addEventListener('resize', resizeCanvas);
// // resizeCanvas(); // Appel initial
 
