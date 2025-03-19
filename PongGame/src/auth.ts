import { API, PublicUser } from "./api";
import { getTranslation } from "./language";

const api = new API("https://localhost:3000"); // URL du backend

export async function checkSession(): Promise<PublicUser | null> {
	try {
		const response = await api.getUsers();
		const currentUser = response.find(user => user.status === "online");

		if (currentUser) {
			// console.log("✅ Session active :", currentUser.username);
			return currentUser; // Retourne l'objet utilisateur connecté
		} else {
			// console.log("❌ Aucun utilisateur connecté.");
			return null;
		}
	} catch (error: any) {
		console.error("❌ Erreur lors de la vérification de session :", error.message);
		return null;
	}
}

export async function registerUser(username: string, email: string, password: string): Promise<string> {
	try {
		const user = await api.registerUser({ username, email, password });
		console.log(`✅ Utilisateur enregistré: ${user.username}`);
		// Utilisation de la traduction
		const successMessage = getTranslation("registerSuccess").replace("{username}", user.username);
		return successMessage;
	} catch (error: any) {
		// Traduction du message d'erreur
		const errorMessage = getTranslation("registerError").replace("{error}", error.message);
		throw new Error(errorMessage);
	}
}

export async function loginUser(identifier: string, password: string): Promise<string> {
	try {
		const response = await api.loginUser({ identifier, password });
		console.log(`✅ Connecté en tant que ${response.user.username}`);
		const successMessage = getTranslation("loginSuccess").replace("{username}", response.user.username);
		return successMessage;
	} catch (error: any) {
		console.error("❌ Erreur de connexion :", error.message);
		const errorMessage = getTranslation("loginError").replace("{error}", error.message);
		throw new Error(errorMessage);
	}
}

export async function logoutUser(): Promise<void> {
	try {
		const currentUser = await checkSession(); // 🔄 Récupérer l'utilisateur connecté

		if (!currentUser) {
			console.log("❌ Aucun utilisateur connecté.");
			return;
		}
		await api.logoutUser({ id: currentUser.id }); // Déconnexion API
		console.log(`✅ Déconnecté : ${currentUser.username}`);
	} catch (error: any) {
		console.error("❌ Erreur lors de la déconnexion :", error.message);
	}
}
