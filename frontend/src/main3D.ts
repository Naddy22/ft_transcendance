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

const languageSelect = document.getElementById("languageSelect") as HTMLSelectElement;
const homeButton = document.getElementById("homeButton") as HTMLButtonElement;
const menu = document.getElementById('menu') as HTMLElement;
const menuButton = document.getElementById("menuButton") as HTMLButtonElement;
const menuDropdown = document.getElementById("menuDropdown") as HTMLElement;

const authButton = document.getElementById("authButton") as HTMLElement;
const authPage = document.getElementById("authPage") as HTMLElement;
const loginForm = document.getElementById("loginForm") as HTMLFormElement;
const registerForm = document.getElementById("registerForm") as HTMLFormElement;
const loginMessage = document.getElementById("loginMessage") as HTMLParagraphElement;
const registerMessage = document.getElementById("registerMessage") as HTMLParagraphElement;

const setup2FABtn = document.getElementById("setup2FABtn") as HTMLButtonElement;
const confirm2FASetupBtn = document.getElementById("confirm2FASetupBtn") as HTMLButtonElement;
const disable2FABtn = document.getElementById("disable2FABtn") as HTMLButtonElement;
const qrCodeImg = document.getElementById("qrCodeImg") as HTMLImageElement;
const setup2FACode = document.getElementById("setup2FACode") as HTMLInputElement;
const twoFactorResponse = document.getElementById("twoFactorResponse")!;
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
const nextMatchButton = document.getElementById('nextMatchButton') as HTMLButtonElement;

const playerInputs = document.getElementById("playerInputs") as HTMLElement;
const inputsContainer = document.getElementById("inputsContainer") as HTMLElement;
const playersForm = document.getElementById("playersForm") as HTMLFormElement;

let currentUser: { id: number; username: string; email: string } | null = null;
let loggedInUserId: number | null = null;
let playerNames: string[] = [];
let lastPlayers: string[] = [];
let isTournamentMode: boolean = false;
let isVsAIMode: boolean = false;
let currentTournament: Tournament | null = null;
let playerNumber: number = 0;

history.replaceState({ page: 'menu' }, 'Menu', '#menu');

// Loads the language saved at startup
document.addEventListener("DOMContentLoaded", () => {
	const savedLanguage = localStorage.getItem("language") || "fr";
	languageSelect.value = savedLanguage;
	loadLanguage(savedLanguage).then(translations => applyTranslations(translations));
});

languageSelect.addEventListener("change", () => {
	const selectedLanguage = languageSelect.value;
	loadLanguage(selectedLanguage).then(translations => applyTranslations(translations));

	// Trigger a global event to warn BabylonJS
	const languageChangedEvent = new Event("languageChanged");
	document.dispatchEvent(languageChangedEvent);
});

// Disables up/down arrows on language selector
languageSelect.addEventListener("keydown", (event) => {
	if (event.key === "ArrowUp" || event.key === "ArrowDown") {
		event.preventDefault();
	}
});

function updateAuthButton() {
	const logoutButton = document.getElementById("logoutButton") as HTMLElement;

	checkSession(loggedInUserId!).then((user) => {
		currentUser = user;
		if (currentUser) {
			logoutButton.style.display = "block";
			authButton.style.display = "none";
		
			menuButton.style.display = "block";
			menuButton.style.paddingTop = "10px";
			homeButton.style.visibility = "visible";
			playVsGuest.style.display = "block";
			playVsAIButton.style.display = "block";
			tournamentButton.style.display = "block";
		} else {
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

authButton.addEventListener("click", () => {
	showAuthPage();
	history.pushState({ page: "auth" }, "Authentification", "#auth");
});

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
		registerMessage.textContent = error.message;
	}
});

loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const identifier = (document.getElementById("loginIdentifier") as HTMLInputElement).value;
	const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

	try {
		const response = await loginUser(identifier, password);

		if (response.requires2FA && response.user) {
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
		loginMessage.style.color = "red";
		loginMessage.textContent = error.message;
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
		login2FAResponse.textContent = "❌";
		login2FAResponse.style.color = "red";
		return;
	}

	try {
		const res = await verify2FALogin(loggedInUserId, token);
		login2FAResponse.textContent = res.message;
		login2FAResponse.style.color = "green";

		document.getElementById("twoFactorLoginModal")!.style.display = "none";
		login2FAResponse.textContent = "";
		login2FACode.value = "";

		authPage.style.display = "none";
		showMenu();
		updateAuthButton();
		history.pushState({ page: "menu" }, "Menu", "#menu");
	} catch (error: any) {
		login2FAResponse.textContent = error.message;
		login2FAResponse.style.color = "red";
	}
});

document.addEventListener("DOMContentLoaded", () => {
	updateAuthButton();
});

function showPlayerInputs(players: number) {
	menu.style.display = 'none';
	authPage.style.display = "none";
	tournamentOptions.style.display = "none";
	game.style.display = 'none';
	endScreen.style.display = 'none';
	inputsContainer.innerHTML = "";

	inputsContainer.innerHTML += `<input type="text" value="${currentUser?.username}" id="player1"><br>`;

	for (let i = 2; i <= players; i++) {
		const placeholderText = String(getTranslation("playerPlaceholder")).replace("{num}", String(i));
		inputsContainer.innerHTML += `<input type="text" placeholder="${placeholderText}" id="player${i}" required><br>`;
	}
	playerInputs.style.display = 'block';
}

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
	loginMessage.textContent = "";
	registerMessage.textContent = "";
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
	replayButton.style.display = isTournament ? 'none' : 'block';
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
	tournamentOptions.style.display = 'block';
}

window.addEventListener("click", function(event) {
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
	stopPongGame();
	showMenu();
	history.pushState({ page: "menu" }, "Menu", "#menu");
});

function loadUserProfile() {
	getCompleteProfile(currentUser!.id)
		.then(({ profile, friends }) => {
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
			(document.getElementById("friendSearchResults")!).innerHTML = "";

			updateFriendsUI(friends);
		})
		.catch(error => {
			alert(getTranslation("profileLoadError"));
		});
}

profileForm.addEventListener("submit", (event) => {
	event.preventDefault();

	const clickedButton = event.submitter as HTMLButtonElement;
	if (clickedButton.id !== "saveChangesBtn") return;

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
		loadUserProfile();

		setTimeout(() => {
			profileMessage.style.opacity = "0";
		}, 10000);
	})
	.catch(error => {
		profileMessage.style.color = "red";
		profileMessage.textContent = `${error.message}`;

		setTimeout(() => {
			profileMessage.style.opacity = "0";
		}, 10000);
	});
	profileMessage.style.opacity = "1";
});

uploadAvatarBtn.addEventListener("click", () => {
	if (!currentUser!.id || !avatarInput.files || avatarInput.files.length === 0) return;

	uploadAvatar(currentUser!.id, avatarInput.files[0])
		.then(newAvatarUrl => {
			(document.getElementById("userAvatar")! as HTMLImageElement).src = newAvatarUrl;
		})
		.catch(error => alert(`${error.message}`));
});

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
			twoFactorResponse.textContent = error.message;
			setTimeout(() => {
				twoFactorResponse.style.display = "none";
			}, 10000);
		});
});

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

function updateFriendsUI(friends: { id: number; username: string; avatar: string | null | undefined; status: string }[]) {
	friendList.innerHTML = "";
	if (friends.length === 0) {
		friendList.innerHTML = `<li>${getTranslation("noFriends")}</li>`;
		return;
	}

	friends.forEach(friend => {
		const li = document.createElement("li");
		li.id = `friend-${friend.id}`;

		const avatarImg = document.createElement("img");
		avatarImg.src = friend.avatar || "/avatars/default/default_cat.webp";
		avatarImg.alt = `${friend.username}'s avatar`;
		avatarImg.width = 42;
		avatarImg.height = 42;
		avatarImg.style.marginRight = "0px";
		avatarImg.style.borderRadius = "50%";
		avatarImg.style.verticalAlign = "middle";
		
		const textSpan = document.createElement("span");
		textSpan.textContent = `${friend.username} (${friend.status})`;

		const removeBtn = document.createElement("button");
		removeBtn.textContent = "❌";
		removeBtn.addEventListener("click", () => removeFriendUI(friend.id));

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
		return;
	}

	searchUsers(query)
		.then(results => {
			friendSearchResults.innerHTML = "";
			if (results.length === 0) {
				friendSearchResults.innerHTML = `<li>${getTranslation("noUserFound")}</li>`;
				return;
			}
			results.forEach(user => {
				const listItem = document.createElement("li");

				const avatarImg = document.createElement("img");
				avatarImg.src = user.avatar || "/avatars/default/default_cat.webp";
				avatarImg.alt = `${user.username}'s avatar`;
				avatarImg.width = 42;
				avatarImg.height = 42;
				avatarImg.style.marginRight = "10px";
				avatarImg.style.borderRadius = "50%";
				avatarImg.style.verticalAlign = "middle";
			
				const userText = document.createElement("span");
				userText.textContent = `${user.username} (${user.email}) (${user.status})`;
	
				const addBtn = document.createElement("button");
				addBtn.textContent = getTranslation("addFriendBtn");
				addBtn.addEventListener("click", () => addFriendUI(user.id));
			
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
			loadUserProfile();
		})
		.catch(error => alert(`${error.message}`));
}

function removeFriendUI(friendId: number) {
	removeFriend(currentUser!.id, friendId)
		.then(message => {
			document.getElementById(`friend-${friendId}`)?.remove();
		})
		.catch(error => alert(`${error.message}`));
}

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

document.getElementById("anonymizeBtn")!.addEventListener("click", () => {
	const confirmationMessage = getTranslation("anonymizeConfirm");
	if (!currentUser!.id || !confirm(confirmationMessage)) return;

	anonymizeUser(currentUser!.id)
		.then(message => {
			alert(message);
			logoutUser().then(() => {
				window.location.reload();
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

deleteAccountBtn.addEventListener("click", () => {
	const confirmationMessage = getTranslation("deleteConfirm");
	if (!currentUser!.id || !confirm(confirmationMessage)) return;

	deleteUserAccount(currentUser!.id)
		.then(message => {
			window.location.reload();
		})
		.catch(error => {
			document.getElementById("deleteMessage")!.textContent = `${error.message}`;
		});
});

menuButton.addEventListener("click", () => {
	menuDropdown.classList.toggle("active");
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
			updateHistoryUI(currentUser!.id);
			historyModal.style.display = "flex";
		}
		if (target.dataset.action === "howToPlay" && howToPlayModal) {
			event.preventDefault();
			howToPlayModal.style.display = "flex";
		}
		if (target.dataset.action === "statistics" && statsModal) {
			event.preventDefault();
			updateStatsUI(currentUser!.id);
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
				updateAuthButton();
				history.pushState({ page: "menu" }, "Menu", "#menu");
				showMenu();
			});
		}
		menuDropdown.classList.remove("active");
	});
}

if (closeButton) {
	closeButton.forEach((button) => {
		button.addEventListener("click", () => {
			const modal = button.closest(".modal") as HTMLElement;
			if (modal) {
				modal.style.display = "none";
			}
		});
	});
}

if (playVsGuest) {
	playVsGuest.addEventListener('click', function() {
		playerNames = [currentUser!.username, getTranslation("playerTwo")];
		lastPlayers = playerNames.slice();
		showGame();

		history.pushState({ page: 'game', isVsAI: false, isTournament: false, playerNames: [...playerNames] }, 'Jeu', '#game');

		if (playerNames.length === 2) {
			isTournamentMode = false;
			isVsAIMode = false;
			startPongGame(playerNames[0], playerNames[1], false, (winner) => {
				let result = winner === playerNames[0] ? "win" : "loss";
				// add to history
				addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
				addGameToStats(currentUser!.id, result);
				showEndScreen(winner);
			});
		} else {
			showMenu();
		}
	});
}

playVsAIButton.addEventListener("click", () => {
	isTournamentMode = false;
	isVsAIMode = true;

	playerNames = [currentUser!.username, getTranslation("AIPlayer")];
	lastPlayers = playerNames.slice();

	showGame();
	history.pushState({ page: 'game', isVsAI: true, isTournament: false, playerNames: [...playerNames]}, 'Jeu', '#game');

	startPongGame(playerNames[0], playerNames[1], true, (winner) => {
		let result = winner === playerNames[0] ? "win" : "loss";
		// Add to history
		addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);;
		addGameToStats(currentUser!.id, result);
		showEndScreen(winner);
	});
});

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

playersForm.addEventListener("submit", (event) => {
	event.preventDefault();
	playerNames = [];
	for (let i = 1; i <= inputsContainer.children.length / 2; i++) {
		const input = document.getElementById(`player${i}`) as HTMLInputElement;
		// Removes dangerous characters (XSS protection)
		const pseudo = input.value.trim().replace(/[<>"'&`]/g, "");
		playerNames.push(pseudo);
	}
	// Checking for duplicate names
	const uniqueNames = new Set(playerNames);
	if (uniqueNames.size !== playerNames.length) {
		alert(getTranslation("uniquePlayerNames"));
		return;
	}
	playerInputs.style.display = "none";
	showGame();

	history.pushState({ page: 'game', isVsAI: false, isTournament: true, playerNames: [...playerNames]}, 'Jeu', '#game');

	if (playerNames.length === 4 || playerNames.length === 8) {
		isTournamentMode = true;
		isVsAIMode = false;
		currentTournament = new Tournament(playerNames);
		currentTournament.start((winner) => {
			if (currentTournament && currentTournament.isTournamentOver()) {
				let result = winner === playerNames[0] ? "win" : "loss";
				// Add to history
				addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
				addGameToStats(currentUser!.id, result);
				showEndScreen(winner, true, true);
			} else {
				showEndScreen(winner, true);
			}
		});
	}
	
});

replayButton.addEventListener('click', () => {
	stopPongGame();
	showGame();
	history.pushState({ page: 'game', isVsAI: isVsAIMode, isTournament: false, playerNames: [...playerNames]}, 'Jeu', '#game');
	startPongGame(lastPlayers[0], lastPlayers[1], isVsAIMode, (winner) => {
		let result = winner === lastPlayers[0] ? "win" : "loss";
		// Add to history
		addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
		addGameToStats(currentUser!.id, result);
		showEndScreen(winner);
	});
});

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
			if (currentTournament && currentTournament.isTournamentOver()) {
				let result = winner === lastPlayers[0] ? "win" : "loss";
				// Add to history
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

window.addEventListener("popstate", (event) => {
	console.log("popstate event:", event.state);

	menu.style.display = "none";
	game.style.display = "none";
	endScreen.style.display = "none";
	tournamentOptions.style.display = "none";
	playerInputs.style.display = "none";
	
	if (!event.state || !event.state.page) {
		console.log("Default state.");
		showMenu();
		history.replaceState({ page: "menu" }, "Menu", "#menu");
		return;
	}

	let lastGameWasVsAI = event.state.isVsAI; 
	let lastGameWasTournament = event.state.isTournament;
	let StatePlayerNames = event.state.playerNames || [];

	switch (event.state.page) {
		case "menu":
			console.log("menu using popstate");
			stopPongGame();
			showMenu();
			currentTournament = null;
			break;
		
		case "auth":
			console.log("auth using popstate");
			showAuthPage();
			break;

		case "game":
			console.log("game using popstate");
			lastPlayers = playerNames.slice();
			showGame();

			if (lastGameWasVsAI) {
				isTournamentMode = false;
				isVsAIMode = true;

				lastPlayers = StatePlayerNames.slice();

				startPongGame(StatePlayerNames[0], StatePlayerNames[1], true, (winner) => {
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Add to history
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
					showEndScreen(winner);
				});
			}
			else if (lastGameWasTournament) {
				isTournamentMode = true;
				isVsAIMode = false;
				currentTournament = new Tournament(StatePlayerNames);
				currentTournament.start((winner) => {
				if (currentTournament && currentTournament.isTournamentOver()) {
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Add to history
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
					showEndScreen(winner, true, true);
				} else {
					showEndScreen(winner, true);
				}
			});
			} else {
				lastPlayers = StatePlayerNames.slice();
				isTournamentMode = false;
				isVsAIMode = false;

				startPongGame(StatePlayerNames[0], StatePlayerNames[1], false, (winner) => {
					let result = winner === StatePlayerNames[0] ? "win" : "loss";
					// Add to history
					addGameToHistory(currentUser!.id, isTournamentMode ? "gameTournament" : isVsAIMode ? "gameVsAI" : "game1v1", result);
					addGameToStats(currentUser!.id, result);
					showEndScreen(winner);
				});
			}
			break;


		case "tournamentOption":
			console.log("tournamentOption using popstate");
			showTournamentOption();
			break;

		case "tournamentForm":
			stopPongGame();
			console.log("tournamentForm using popstate");
			showPlayerInputs(playerNumber);
			break;

		default:
			console.log("Unknown state, back to menu.");
			showMenu();
	}
});
