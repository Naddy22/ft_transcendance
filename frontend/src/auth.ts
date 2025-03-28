import { API, PublicUser } from "./api";
import { getTranslation, getErrorMessage } from "./language";

const api = new API("");

export async function checkSession(userId?: number): Promise<PublicUser | null> {
	try {
		if (userId) {
			const user = await api.getUser(userId);
			if (user) return user;
		}

		const users = await api.getUsers();
		const currentUser = users.find(user => user.status === "online");
		return currentUser || null;
	} catch (error: any) {
		console.error("❌ Checksession Error:", error.message);
		return null;
	}
}

export async function registerUser(username: string, email: string, password: string): Promise<string> {
	try {
		const user = await api.registerUser({ username, email, password });
		const successMessage = getTranslation("registerSuccess").replace("{username}", user.username);
		return successMessage;
	} catch (error: any) {
		const errorMessage = getTranslation("registerError").replace("{error}", getErrorMessage(error.message));
		throw new Error(errorMessage);
	}
}

export async function loginUser(identifier: string, password: string): Promise<{ requires2FA: boolean, user?: PublicUser }> {
	try {
		const response = await api.loginUser({ identifier, password });
		return {
			requires2FA: response.requires2FA ?? false,
			user: response.user,
		};
	} catch (error: any) {
		const errorMessage = getTranslation("loginError").replace("{error}", getErrorMessage(error.message));
		throw new Error(errorMessage);
	}
}

export async function logoutUser(): Promise<void> {
	try {
		const currentUser = await checkSession();

		if (!currentUser) {
			return;
		}
		await api.logoutUser({ id: currentUser.id });
		console.log(`✅ Deconnected : ${currentUser.username}`);
	} catch (error: any) {
		console.error("❌ logoutUser error :", error.message);
	}
}
