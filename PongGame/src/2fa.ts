import { API } from "./api";
import { getTranslation, getErrorMessage } from "./language";

const api = new API("https://localhost:3000");

// 📌 Initialiser le 2FA et récupérer le QR code
export async function setup2FA(userId: number): Promise<{ qrCode: string }> {
	try {
		const res = await api.setup2FA(userId);
		return { qrCode: res.qrCode };
	} catch (error: any) {
		console.error("❌ Erreur lors de l'initialisation du 2FA :", error.message);
		const message = getTranslation("2faSetupError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}

// 📌 Vérifier le code de 2FA lors de la configuration
export async function confirm2FASetup(userId: number, token: string): Promise<string> {
	try {
		const res = await api.verify2FA(userId, token);
		return getTranslation("2faSuccess"); // ✅ 2FA activé avec succès !
	} catch (error: any) {
		console.error("❌ Échec de la vérification 2FA :", error.message);
		const message = getTranslation("2faVerificationError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}

// 📌 Désactiver le 2FA
export async function disable2FA(userId: number): Promise<string> {
	try {
		await api.disable2FA(userId);
		return getTranslation("2faDisableSuccess"); // ✅ 2FA désactivé avec succès !
	} catch (error: any) {
		console.error("❌ Erreur désactivation 2FA :", error.message);
		const message = getTranslation("disable2FAError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}