import { API } from "./api";

const api = new API("https://localhost:3000"); // URL du backend

export async function registerUser(username: string, email: string, password: string): Promise<string> {
	try {
		const user = await api.registerUser({ username, email, password });
		console.log(`✅ Utilisateur enregistré: ${user.username}`);
		return `✅ Inscription réussie ! Bienvenue ${user.username}`;
	} catch (error: any) {
		console.error("❌ Erreur d'inscription :", error.message);
		throw new Error(`❌ Inscription échouée : ${error.message}`);
	}
}

export async function loginUser(identifier: string, password: string): Promise<string> {
	try {
		const response = await api.loginUser({ identifier, password });
		console.log(`✅ Connecté en tant que ${response.user.username}`);
		localStorage.setItem("loggedInUser", JSON.stringify(response.user)); // Sauvegarde la session
		return `✅ Connexion réussie ! Bienvenue ${response.user.username}`;
	} catch (error: any) {
		console.error("❌ Erreur de connexion :", error.message);
		throw new Error(`❌ Connexion échouée : ${error.message}`); // ⛔️ Lève l'erreur
	}
}

export function logoutUser(): void {
	localStorage.removeItem("loggedInUser");
	console.log("✅ Déconnecté");
}
