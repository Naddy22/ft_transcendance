import { API, PublicUser } from "./api";
import { getTranslation, getErrorMessage } from "./language";

const api = new API(""); // URL du backend

export async function checkSession(userId?: number): Promise<PublicUser | null> {
	try {
		if (userId) {
			const user = await api.getUser(userId);
			if (user) return user;
		}

		// Fallback pour le local sans 2FA
		const users = await api.getUsers();
		const currentUser = users.find(user => user.status === "online");
		return currentUser || null;
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
		const errorMessage = getTranslation("registerError").replace("{error}", getErrorMessage(error.message));
		throw new Error(errorMessage);
	}
}

export async function loginUser(identifier: string, password: string): Promise<{ requires2FA: boolean, user?: PublicUser }> {
	try {
		// const response = await api.loginUser({ identifier, password });
		// console.log(`✅ Connecté en tant que ${response.user!.username}`);
		// const successMessage = getTranslation("loginSuccess").replace("{username}", response.user!.username);
		// return successMessage;
		const response = await api.loginUser({ identifier, password });
		// ✅ Tu peux logguer la réponse pour debug
		console.log("🔐 Login response:", response);
		return {
			requires2FA: response.requires2FA ?? false,
			user: response.user,
		};
	} catch (error: any) {
		console.error("❌ Erreur de connexion :", error.message);
		const errorMessage = getTranslation("loginError").replace("{error}", getErrorMessage(error.message));
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
