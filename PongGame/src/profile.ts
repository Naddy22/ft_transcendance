import { API } from "./api";
import { getTranslation, getErrorMessage } from "./language";

const api = new API("");

export function getUserProfile(userId: number) {
	return api.getUser(userId)
		.then(user => ({
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.avatar || "/avatars/default/default_cat.webp",
			isTwoFactorEnabled: user.isTwoFactorEnabled
		}))
		.catch(error => {
			console.error("❌ Erreur récupération profil :", error.message);
			throw error;
		});
}

export function updateUserProfile(userId: number, data: { username?: string; email?: string }) {
	return api.updateUser(userId, data)
		.then(() => getTranslation("profileUpdateSuccess"))
		.catch(error => {
			console.error("❌ Erreur mise à jour profil :", error.message);
			const errorMessage = getTranslation("profileUpdateError").replace("{error}", getErrorMessage(error.message));
			throw new Error(errorMessage); // 🔄 Traduction de l'erreur
		});
}

export function updatePassword(userId: number, oldPassword: string, newPassword: string) {
	return api.updatePassword(userId, oldPassword, newPassword)
		.then(() => getTranslation("passwordUpdateSuccess"))
		.catch(error => {
			console.error("❌ Erreur mise à jour du mot de passe :", error.message);
			const errorMessage = getTranslation("passwordUpdateError").replace("{error}", getErrorMessage(error.message));
			throw new Error(errorMessage); // 🔄 Traduction de l'erreur
		});
}

export function uploadAvatar(userId: number, file: File) {
	const formData = new FormData();
	formData.append("file", file);

	return api.uploadAvatar(formData)
		.then(response => {
			return api.updateUser(userId, { avatar: response.avatarUrl }).then(() => response.avatarUrl);
		})
		.catch(error => {
			console.error("❌ Erreur changement d'avatar :", error.message);
			throw error;
		});
}

export function getFriends(userId: number) {
	return api.getFriends(userId)
		.then(friends => friends.map(friend => ({
			id: friend.id,
			username: friend.username,
			status: friend.status
		})))
		.catch(error => {
			console.error("❌ Erreur récupération amis :", error.message);
			throw error;
		});
}

export function searchUsers(query: string) {
	return api.getUsers()
		.then(users => {
			return users.filter(user => {
				if (user.status === "anonymized") return false;
				return (
				user.username.toLowerCase().includes(query.toLowerCase()) ||
				user.email.toLowerCase().includes(query.toLowerCase())
				);
			});
		})
		.catch(error => {
			console.error("❌ Erreur recherche amis :", error.message);
			throw error;
		});
}

export function addFriend(userId: number, friendId: number) {
	return api.addFriend(userId, friendId)
		// .then(() => "✅ Ami ajouté avec succès !")
		.catch(error => {
			console.error("❌ Erreur ajout ami :", error.message);
			throw error;
		});
}

export function removeFriend(userId: number, friendId: number) {
	return api.removeFriend(userId, friendId)
		// .then(() => "✅ Ami supprimé avec succès !")
		.catch(error => {
			console.error("❌ Erreur suppression ami :", error.message);
			throw error;
		});
}


/** ✅ Fonction qui charge tout le profil d'un coup (profil + amis) */
export function getCompleteProfile(userId: number) {
	return Promise.all([
		getUserProfile(userId),
		getFriends(userId)
	])
	.then(([profile, friends]) => ({
		profile,
		friends
	}))
	.catch(error => {
		console.error("❌ Erreur récupération profil complet :", error.message);
		throw error;
	});
}

// 📥 Télécharger ses données personnelles
export function exportUserData(userId: number): Promise<Blob> {
	return api.exportUserData(userId)
		.then(data => new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
		.catch(error => {
			console.error("❌ Erreur lors de l'export :", error);
			throw error;
		});
}

// 🕵️‍♂️ Anonymiser son compte
export function anonymizeUser(userId: number): Promise<string> {
	return api.anonymizeUser(userId)
		.then(() => getTranslation("anonymizeSuccess"))
		.catch(error => {
			console.error("❌ Erreur anonymisation :", error.message);
			const errorMessage = getTranslation("anonymizeError").replace("{error}", error.message);
			throw new Error(errorMessage);
		});
}

export function deleteUserAccount(userId: number) {
	return api.deleteUser(userId)
		// .then(() => "✅ Compte supprimé avec succès !")
		.catch(error => {
			console.error("❌ Erreur suppression compte :", error.message);
			throw error;
		});
}