import { API, MatchHistory, NewMatchHistoryEntry } from "./api";

const api = new API("https://localhost:3000");

export function addGameToHistory(
	userId: number,
	type: "1vs1" | "vs AI" | "Tournament",
	result: string
): void {
	const data: NewMatchHistoryEntry = { userId, type, result };
  
	api.createMatchHistoryEntry(data)
		.then((res) => {
		console.log("History entry added with ID:", res.id);
		updateHistoryUI(userId);
	})
		.catch((error) => {
		console.error("Error adding match history entry:", error.message);
	});
}

// Update the UI by fetching the match history from the backend:
export function updateHistoryUI(userId: number): void {
	const historyList = document.getElementById("gameHistoryList") as HTMLUListElement;
	if (!historyList) return;

	api.getMatchHistory(userId)
	.then((historyEntries: MatchHistory[]) => {
		historyList.innerHTML = "";
		historyEntries.forEach(({ date, type, result }) => {
		const listItem = document.createElement("li");
		listItem.textContent = `${new Date(date).toLocaleString()} - ${type} : ${result}`;
		historyList.appendChild(listItem);
		});
	})
	.catch((error) => {
		console.error("Error updating history UI:", error.message);
	});
}

// export let gameHistory: { date: string, type: string, result: string }[] = [];

// export function addGameToHistory(type: string, result: string): void {
// 	const now = new Date();
// 	const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString();

// 	console.log(`Ajout à l'historique: ${formattedDate} | ${type} | ${result}`);

// 	// Sauvegarde dans le tableau
// 	gameHistory.push({ date: formattedDate, type, result });

// 	// Met à jour l'affichage de l'historique (appel à la fonction qui s'occupe du DOM)
// 	updateHistoryUI();
// }

// export function updateHistoryUI(): void {
// 	const historyList = document.getElementById("gameHistoryList") as HTMLUListElement;
// 	if (!historyList) return;

// 	// Efface l'ancien contenu pour éviter les doublons
// 	historyList.innerHTML = "";

// 	// Ajoute toutes les parties stockées dans gameHistory
// 	gameHistory.forEach(({ date, type, result }) => {
// 		const listItem = document.createElement("li");
// 		listItem.textContent = `${date} - ${type} : ${result}`;
// 		historyList.appendChild(listItem);
// 	});
// 	console.log("Historique mis à jour :", gameHistory); // Vérifie que les données sont bien là
// }