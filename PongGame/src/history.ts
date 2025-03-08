export let gameHistory: { date: string, type: string, result: string }[] = [];

export function addGameToHistory(type: string, result: string): void {
	const now = new Date();
	const formattedDate = now.toLocaleDateString() + " " + now.toLocaleTimeString();

	const row = document.createElement("tr");
	row.innerHTML = `<td>${formattedDate}</td><td>${type}</td><td>${result}</td>`;
	document.getElementById("historyTable")?.querySelector("tbody")?.appendChild(row);

	// Sauvegarde dans le tableau
	gameHistory.push({ date: formattedDate, type, result });
}
