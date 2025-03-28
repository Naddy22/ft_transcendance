import { loadLanguage, applyTranslations } from "./language";
import { startPongGame3D as startPongGame } from './game3D';
import { stopPongGame3D as stopPongGame } from './game3D';
import { Tournament } from './tournament3D';
import { setup2FA, confirm2FASetup, verify2FALogin, disable2FA } from "./2fa";
import { addGameToHistory, updateHistoryUI } from "./history";
import { addGameToStats, updateStatsUI } from "./stats";
import { checkSession, registerUser, loginUser, logoutUser } from "./auth";
import { getCompleteProfile, updateUserProfile, updatePassword, uploadAvatar, searchUsers, addFriend, removeFriend, deleteUserAccount, exportUserData, anonymizeUser} from "./profile";
import { getTranslation } from "./language";
import { PublicUser } from "./api";

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

// const twoFactorSection = document.getElementById("twoFactorSection")!;
const setup2FABtn = document.getElementById("setup2FABtn") as HTMLButtonElement;
const confirm2FASetupBtn = document.getElementById("confirm2FASetupBtn") as HTMLButtonElement;
const disable2FABtn = document.getElementById("disable2FABtn") as HTMLButtonElement;
const qrCodeImg = document.getElementById("qrCodeImg") as HTMLImageElement;
const setup2FACode = document.getElementById("setup2FACode") as HTMLInputElement;
const twoFactorResponse = document.getElementById("twoFactorResponse")!;
// const setup2FAResponse = document.getElementById("setup2FAResponse")!;
// const disable2FAResponse = document.getElementById("disable2FAResponse")!;
const verify2FAForLoginBtn = document.getElementById("verify2FAForLoginBtn") as HTMLButtonElement;
const login2FACode = document.getElementById("login2FACode") as HTMLInputElement;
const login2FAResponse = document.getElementById("login2FAResponse") as HTMLParagraphElement;

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
let loggedInUserId: number | null = null;
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

	// 🔥 Déclenche un événement global pour prévenir BabylonJS et d'autres parties du code
	const languageChangedEvent = new Event("languageChanged");
	document.dispatchEvent(languageChangedEvent);
});

// 🔥 Désactive les flèches haut/bas sur le sélecteur de langue
languageSelect.addEventListener("keydown", (event) => {
	if (event.key === "ArrowUp" || event.key === "ArrowDown") {
		event.preventDefault(); // 🚫 Empêche de changer la langue avec les flèches
	}
});

// 🔹 Vérifie si l'utilisateur est connecté au chargement de la page
function updateAuthButton() {
	console.log("update auth");
	const logoutButton = document.getElementById("logoutButton") as HTMLElement;

	checkSession(loggedInUserId!).then((user) => {
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
		const response = await loginUser(identifier, password);

		if (response.requires2FA && response.user) {
			// L’utilisateur a activé le 2FA
			console.log("2FA est activé !");
			loggedInUserId = response.user.id;
			login2FACode.value = "";
			document.getElementById("twoFactorLoginModal")!.style.display = "flex";
			return;
		}
		else {
			authPage.style.display = "none";
			showMenu();
			updateAuthButton();
			history.pushState({ page: "menu" }, "Menu", "#menu");
		}
	} catch (error: any) {
		loginMessage.style.color = "red"; // ❌ Change la couleur en rouge
		loginMessage.textContent = error.message; // Affiche l'erreur sous le formulaire
	}
});

verify2FAForLoginBtn.addEventListener("click", async () => {
	const token = login2FACode.value.trim();
	if (!token) {
		login2FAResponse.textContent = getTranslation("2faMissingCode");
		login2FAResponse.style.color = "red";
		return;
	}

	if (!loggedInUserId) {
		login2FAResponse.textContent = "❌ Utilisateur inconnu pour 2FA.";
		login2FAResponse.style.color = "red";
		return;
	}

	try {
		const res = await verify2FALogin(loggedInUserId, token);
		console.log(res.message);
		login2FAResponse.textContent = res.message;
		login2FAResponse.style.color = "green";

		console.log("🧠 Token après vérification 2FA :", res.token);

		// setTimeout(() => {
			document.getElementById("twoFactorLoginModal")!.style.display = "none";
			login2FAResponse.textContent = "";
			login2FACode.value = "";

			// 🔄 Reprend le login normal
			authPage.style.display = "none";
			showMenu();
			updateAuthButton();
			history.pushState({ page: "menu" }, "Menu", "#menu");
		// }, 1500);
	} catch (error: any) {
		login2FAResponse.textContent = error.message;
		login2FAResponse.style.color = "red";
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
		const placeholderText = String(getTranslation("playerPlaceholder")).replace("{num}", String(i)); // 🎯 Remplace {num} par le numéro du joueur
		inputsContainer.innerHTML += `<input type="text" placeholder="${placeholderText}" id="player${i}" required><br>`;
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
	winnerMessage.textContent = isFinal ? getTranslation("tournamentWin").replace("{winner}", winner) : getTranslation("matchWin").replace("{winner}", winner);
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
			? getTranslation("nextMatch").replace("{player1}", currentMatch.player1).replace("{player2}", currentMatch.player2)
			: "";
		nextMatchInfo.textContent = nextMatch 
			? getTranslation("nextMatchUpcoming").replace("{player1}", nextMatch.player1).replace("{player2}", nextMatch.player2)
			: isFinal ? getTranslation("tournamentFinal") : getTranslation("matchPreparation");
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
			document.getElementById("qrAndConfirmContainer")!.style.display = "none";
			if (!profile.isTwoFactorEnabled) {
				(document.getElementById("twoFactorDisableSection"))!.style.display = "none";
				(document.getElementById("twoFactorSetupSection"))!.style.display = "block";
			} else {
				(document.getElementById("twoFactorSetupSection"))!.style.display = "none";
				(document.getElementById("twoFactorDisableSection"))!.style.display = "block";
			}
			(document.getElementById("friendSearchInput")! as HTMLInputElement).value = "";
			(document.getElementById("friendSearchResults")!).innerHTML = ""; // ✅ Efface les résultats de recherche

			updateFriendsUI(friends);
		})
		.catch(error => {
			console.error("❌ Erreur chargement profil :", error.message);
			alert(getTranslation("profileLoadError"));
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
		profileMessage.textContent = `${error.message}`;

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
			// alert("✅ Avatar mis à jour !");
		})
		.catch(error => alert(`${error.message}`));
});

// 🔐 Activation 2FA
setup2FABtn.addEventListener("click", async () => {
	twoFactorResponse.textContent = "";
	twoFactorResponse.style.display = "none";
	try {
		const { qrCode } = await setup2FA(currentUser!.id);
		qrCodeImg.src = qrCode;
		setup2FACode.value = "";
		document.getElementById("qrAndConfirmContainer")!.style.display = "block";
	} catch (error: any) {
		twoFactorResponse.textContent = error.message;
		twoFactorResponse.style.display = "block";
		setTimeout(() => {
			twoFactorResponse.style.display = "none";
		}, 10000);
	}
});

// ✅ Confirmer 2FA
confirm2FASetupBtn.addEventListener("click", async () => {
	const token = setup2FACode.value.trim();
	twoFactorResponse.textContent = "";
	twoFactorResponse.style.display = "block";

	if (!token) {
		twoFactorResponse.textContent = getTranslation("2faMissingCode");
		return;
	}

	confirm2FASetup(currentUser!.id, token)
		.then((message) => {
			twoFactorResponse.textContent = message;
			document.getElementById("qrAndConfirmContainer")!.style.display = "none";
			loadUserProfile()
			setTimeout(() => {
				twoFactorResponse.style.display = "none";
			}, 10000);
		})
		.catch((error: any) => {
			console.error("❌ Erreur 2FA confirm:", error);
			twoFactorResponse.textContent = error.message;
			setTimeout(() => {
				twoFactorResponse.style.display = "none";
			}, 10000);
		});
});

// ❌ Désactiver 2FA
disable2FABtn.addEventListener("click", async () => {
	twoFactorResponse.textContent = "";
	twoFactorResponse.style.display = "none";
	try {
		const message = await disable2FA(currentUser!.id);
		twoFactorResponse.textContent = message;
		twoFactorResponse.style.display = "block";
		document.getElementById("twoFactorDisableSection")!.style.display = "none";
		document.getElementById("qrAndConfirmContainer")!.style.display = "none";
		loadUserProfile();
		setTimeout(() => {
			twoFactorResponse.style.display = "none";
		}, 10000);
	} catch (error: any) {
		alert(error.message);
	}
});

// 📌 Mettre à jour l'affichage des amis
function updateFriendsUI(friends: { id: number; username: string; avatar: string | null | undefined; status: string }[]) {
	friendList.innerHTML = "";
	if (friends.length === 0) {
		friendList.innerHTML = `<li>${getTranslation("noFriends")}</li>`;
		return;
	}

	friends.forEach(friend => {
		const li = document.createElement("li");
		li.id = `friend-${friend.id}`;

		// 📷 Crée l'image de l'avatar
		const avatarImg = document.createElement("img");
		avatarImg.src = friend.avatar || "/avatars/default/default_cat.webp"; // si pas d'avatar → image par défaut
		avatarImg.alt = `${friend.username}'s avatar`;
		avatarImg.width = 42;
		avatarImg.height = 42;
		avatarImg.style.marginRight = "0px";
		avatarImg.style.borderRadius = "50%"; // rond = joli
		avatarImg.style.verticalAlign = "middle"; // aligne bien avec le texte
		
		const textSpan = document.createElement("span");
		textSpan.textContent = `${friend.username} (${friend.status})`;

		const removeBtn = document.createElement("button");
		removeBtn.textContent = "❌";
		removeBtn.addEventListener("click", () => removeFriendUI(friend.id));

		// Ajoute tout dans <li>
		li.appendChild(avatarImg);
		li.appendChild(textSpan);
		li.appendChild(removeBtn);

		friendList.appendChild(li);
	});
}

friendSearchBtn.addEventListener("click", () => {
	const query = (document.getElementById("friendSearchInput")! as HTMLInputElement).value.trim();
	const friendSearchResults = document.getElementById("friendSearchResults")!;

	if (!query) {
		// alert("❌ Veuillez entrer un nom ou un email pour la recherche.");
		return;
	}

	searchUsers(query)
		.then(results => {
			friendSearchResults.innerHTML = ""; // Vide la liste précédente

			if (results.length === 0) {
				friendSearchResults.innerHTML = `<li>${getTranslation("noUserFound")}</li>`;
				return;
			}

			results.forEach(user => {
				const listItem = document.createElement("li");

				// 📷 Avatar
				const avatarImg = document.createElement("img");
				avatarImg.src = user.avatar || "/avatars/default/default_cat.webp";
				avatarImg.alt = `${user.username}'s avatar`;
				avatarImg.width = 42;
				avatarImg.height = 42;
				avatarImg.style.marginRight = "10px";
				avatarImg.style.borderRadius = "50%";
				avatarImg.style.verticalAlign = "middle";
			
				// 🔹 Crée un élément pour le texte (pseudo + email)
				const userText = document.createElement("span");
				userText.textContent = `${user.username} (${user.email}) (${user.status})`;
			
				// 🔹 Crée le bouton "Ajouter"
				const addBtn = document.createElement("button");
				addBtn.textContent = getTranslation("addFriendBtn");
				addBtn.addEventListener("click", () => addFriendUI(user.id));
			
				// 🔹 Ajoute le texte et le bouton dans la ligne
				listItem.appendChild(avatarImg);
				listItem.appendChild(userText);
				listItem.appendChild(addBtn);
			
				friendSearchResults.appendChild(listItem);
			});
			
		})
		.catch(error => {
			friendSearchResults.innerHTML = `<li>${error.message}</li>`;
		});
});

function addFriendUI(friendId: number) {
	addFriend(currentUser!.id, friendId)
		.then(message => {
			// alert(message);
			loadUserProfile(); // Recharge la liste d'amis après ajout
		})
		.catch(error => alert(`${error.message}`));
}

// 📌 Supprimer un ami
function removeFriendUI(friendId: number) {
	removeFriend(currentUser!.id, friendId)
		.then(message => {
			// alert(message);
			document.getElementById(`friend-${friendId}`)?.remove();
		})
		.catch(error => alert(`${error.message}`));
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

			// 🔥 Utilisation de la traduction
			const exportMessage = document.getElementById("exportMessage")!;
			exportMessage.textContent = getTranslation("exportSuccess");

			setTimeout(() => {
				document.getElementById("exportMessage")!.style.display = "none";
			}, 10000);
		})
		.catch(error => {
			const exportMessage = document.getElementById("exportMessage")!;
			exportMessage.textContent = getTranslation("exportError").replace("{error}", error.message);
			setTimeout(() => {
				document.getElementById("exportMessage")!.style.display = "none";
			}, 10000);
		});
		document.getElementById("exportMessage")!.style.display = "block";
});

// 🕵️‍♂️ Anonymiser le compte
document.getElementById("anonymizeBtn")!.addEventListener("click", () => {
	const confirmationMessage = getTranslation("anonymizeConfirm");
	if (!currentUser!.id || !confirm(confirmationMessage)) return;

	anonymizeUser(currentUser!.id)
		.then(message => {
			alert(message);
			logoutUser().then(() => {
				window.location.reload(); // 🔄 Recharge la page en mode non connecté
			});
		})
		.catch(error => {
			document.getElementById("anonymizeMessage")!.textContent = `${error.message}`;
			setTimeout(() => {
				document.getElementById("anonymizeMessage")!.style.display = "none";
			}, 10000);
		});
		document.getElementById("anonymizeMessage")!.style.display = "block";
});

// 📌 Supprimer son compte
deleteAccountBtn.addEventListener("click", () => {
	const confirmationMessage = getTranslation("deleteConfirm");
	if (!currentUser!.id || !confirm(confirmationMessage)) return;

	deleteUserAccount(currentUser!.id)
		.then(message => {
			// alert(message);
			window.location.reload();
		})
		.catch(error => {
			document.getElementById("deleteMessage")!.textContent = `${error.message}`;
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
				loggedInUserId = null;
				updateAuthButton(); // Met à jour l'affichage des boutons
				// 🔄 Ajoute un nouvel état propre après la déconnexion
				history.pushState({ page: "menu" }, "Menu", "#menu");
				showMenu(); // Affiche le menu
			});
		}
		menuDropdown.classList.remove("active");
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
		playerNames = [currentUser!.username, getTranslation("playerTwo")];
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
				let result = winner === playerNames[0] ? "win" : "loss";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
				addGameToStats(currentUser!.id, result);
				showEndScreen(winner);
			});
		} else {
			// alert("Pas assez de joueurs pour jouer !");
			showMenu();
		}
	});
}

playVsAIButton.addEventListener("click", () => {
	console.log("Démarrage du jeu contre l'IA");
	isTournamentMode = false;
	isVsAIMode = true;

	playerNames = [currentUser!.username, getTranslation("AIPlayer")];
	lastPlayers = playerNames.slice(); // Sauvegarde pour "Rejouer"

	showGame();
	history.pushState({ page: 'game', isVsAI: true, isTournament: false, playerNames: [...playerNames]}, 'Jeu', '#game');

	startPongGame(playerNames[0], playerNames[1], true, (winner) => {
		console.log("Match terminé, gagnant :", winner);

		// Déterminer le résultat
		let result = winner === playerNames[0] ? "win" : "loss";
		// Ajouter à l’historique
		addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);;
		addGameToStats(currentUser!.id, result);
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
	history.pushState({ page: 'tournamentForm' }, 'tournamentForm', '#tournamentForm');
});
tournament8.addEventListener("click", () => {
	playerNumber = 8;
	showPlayerInputs(playerNumber);
	history.pushState({ page: 'tournamentForm' }, 'tournamentForm', '#tournamentForm');
});

// Gérer le clic sur "lancer le tournoi"
playersForm.addEventListener("submit", (event) => {
	event.preventDefault(); // Empêche le rechargement de la page
	playerNames = [];
	for (let i = 1; i <= inputsContainer.children.length / 2; i++) {
		const input = document.getElementById(`player${i}`) as HTMLInputElement;
		// Supprime les caractères dangereux (protection XSS)
		const pseudo = input.value.trim().replace(/[<>"'&`]/g, "");
		playerNames.push(pseudo);
	}
	// Vérification des noms dupliqués
	const uniqueNames = new Set(playerNames); // Convertit la liste en "Set" (qui ne peut pas avoir de doublons)
	if (uniqueNames.size !== playerNames.length) {
		alert(getTranslation("uniquePlayerNames"));
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
				let result = winner === playerNames[0] ? "win" : "loss";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
				addGameToStats(currentUser!.id, result);
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
		let result = winner === lastPlayers[0] ? "win" : "loss";
		// Ajouter à l’historique
		addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
		addGameToStats(currentUser!.id, result);
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
				let result = winner === lastPlayers[0] ? "win" : "loss";
				// Ajouter à l’historique
				addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
				addGameToStats(currentUser!.id, result);
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
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
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
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
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
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Ajouter à l’historique
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
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
 
