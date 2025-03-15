import { API } from "./api";

const api = new API("https://localhost:3000");

export function getUserProfile(userId: number) {
	return api.getUser(userId)
		.then(user => ({
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.avatar || "/avatars/default.png",
		}))
		.catch(error => {
			console.error("❌ Erreur récupération profil :", error.message);
			throw error;
		});
}

export function updateUserProfile(userId: number, data: { username?: string; email?: string }) {
	return api.updateUser(userId, data)
		.then(() => "✅ Profil mis à jour avec succès !")
		.catch(error => {
			console.error("❌ Erreur mise à jour profil :", error.message);
			throw error;
		});
}

export function updatePassword(userId: number, oldPassword: string, newPassword: string) {
	// return api.updatePassword(userId, oldPassword, newPassword)
	// 	.then(() => "✅ Mot de passe mis à jour avec succès !")
	// 	.catch(error => {
	// 		console.error("❌ Erreur mise à jour du mot de passe :", error.message);
	// 		throw error;
	// 	});
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
		})))
		.catch(error => {
			console.error("❌ Erreur récupération amis :", error.message);
			throw error;
		});
}

export function searchUsers(query: string) {
	return api.getUsers()
		.then(users => {
			return users.filter(user => 
				user.username.toLowerCase().includes(query.toLowerCase()) ||
				user.email.toLowerCase().includes(query.toLowerCase())
			);
		})
		.catch(error => {
			console.error("❌ Erreur recherche amis :", error.message);
			throw error;
		});
}

export function addFriend(userId: number, friendId: number) {
	return api.addFriend(userId, friendId)
		.then(() => "✅ Ami ajouté avec succès !")
		.catch(error => {
			console.error("❌ Erreur ajout ami :", error.message);
			throw error;
		});
}

export function removeFriend(userId: number, friendId: number) {
	return api.removeFriend(userId, friendId)
		.then(() => "✅ Ami supprimé avec succès !")
		.catch(error => {
			console.error("❌ Erreur suppression ami :", error.message);
			throw error;
		});
}

export function deleteUserAccount(userId: number) {
	return api.deleteUser(userId)
		.then(() => "✅ Compte supprimé avec succès !")
		.catch(error => {
			console.error("❌ Erreur suppression compte :", error.message);
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
