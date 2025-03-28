import { API } from "./api";
import { getTranslation, getErrorMessage } from "./language";

const api = new API("");

export async function setup2FA(userId: number): Promise<{ qrCode: string }> {
	try {
		const res = await api.setup2FA(userId);
		return { qrCode: res.qrCode };
	} catch (error: any) {
		const message = getTranslation("2faSetupError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}

export async function confirm2FASetup(userId: number, token: string): Promise<string> {
	try {
		const res = await api.confirm2FASetup(userId, token);
		return getTranslation("2faSuccess");
	} catch (error: any) {
		const message = getTranslation("2faVerificationError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}

export async function verify2FALogin(userId: number, token: string): Promise<{ message: string; token?: string }> {
	try {
		const res = await api.verify2FA(userId, token);
		if (res.token) {
			localStorage.setItem("token", res.token);
		}
		return {
			message: getTranslation("2faLoginSuccess"),
			token: res.token,
		};
	} catch (error: any) {
		throw new Error(getErrorMessage(error.message));
	}
}

export async function disable2FA(userId: number): Promise<string> {
	try {
		await api.disable2FA(userId);
		return getTranslation("2faDisableSuccess");
	} catch (error: any) {
		const message = getTranslation("disable2FAError").replace("{error}", getErrorMessage(error.message));
		throw new Error(message);
	}
}