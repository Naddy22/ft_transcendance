export let gameHistory: { date: string, type: string, result: string }[] = [];

export function addGameToHistory(type: string, result: string): void {
	const now = new Date();
	const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString();

	console.log(`Ajout à l'historique: ${formattedDate} | ${type} | ${result}`);

	// Sauvegarde dans le tableau
	gameHistory.push({ date: formattedDate, type, result });

	// Met à jour l'affichage de l'historique (appel à la fonction qui s'occupe du DOM)
	updateHistoryUI();
}

export function updateHistoryUI(): void {
	const historyList = document.getElementById("gameHistoryList") as HTMLUListElement;
	if (!historyList) return;

	// Efface l'ancien contenu pour éviter les doublons
	historyList.innerHTML = "";

	// Ajoute toutes les parties stockées dans gameHistory
	gameHistory.forEach(({ date, type, result }) => {
		const listItem = document.createElement("li");
		listItem.textContent = `${date} - ${type} : ${result}`;
		historyList.appendChild(listItem);
	});
	console.log("Historique mis à jour :", gameHistory); // Vérifie que les données sont bien là
}

// // 🎯 Écouteurs d'événements spécifiques à l'historique
// export function setupHistoryListeners() {
// 	const historyButton = document.getElementById("historyButton") as HTMLElement;
// 	// const closeHistoryButton = document.getElementById("closeHistoryButton") as HTMLElement;
// 	const closeHistoryButton = document.querySelector(".close") as HTMLElement;
// 	const historyModal = document.getElementById("historyModal") as HTMLElement;
	
// 	// 📜 Ouvrir l’historique
// 	historyButton.addEventListener("click", (event) => {
// 		event.preventDefault();
// 		updateHistoryUI();
// 		historyModal.style.display = "flex";
// 	});

// 	// ❌ Fermer l’historique
// 	closeHistoryButton.addEventListener("click", () => {
// 		historyModal.style.display = "none";
// 	});

// 	// ❌ Fermer si on clique en dehors
// 	window.addEventListener("click", (event) => {
// 		if (event.target === historyModal) {
// 			historyModal.style.display = "none";
// 		}
// 	});
// }
