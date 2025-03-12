import Chart from "chart.js/auto"; // 📊 pour graphique

/** A changé apres pour l'endroit ou stocker dans le backend */
let gameStats = {
	totalGames: 0,
	wins: 0,
	losses: 0,
	ratio: 0,
};

let statsChart: Chart | null = null; // Variable pour stocker le graphique

/* Ajoute une partie aux statistiques */
export function addGameToStats(result: string): void {
	gameStats.totalGames++;

	if (result === "Victoire") {
		gameStats.wins++;
	} else {
		gameStats.losses++;
	}

	gameStats.ratio = gameStats.totalGames > 0 ? (gameStats.wins / gameStats.totalGames) * 100 : 0;

	console.log("📊 Statistiques mises à jour (local)", gameStats);
}

/* Met à jour l'affichage des stats dans la modal */
export function updateStatsUI(): void {
	const totalGamesEl = document.getElementById("totalGames") as HTMLElement;
	const winsEl = document.getElementById("wins") as HTMLElement;
	const lossesEl = document.getElementById("losses") as HTMLElement;
	const winRate = document.getElementById("winRate") as HTMLElement;

	if (totalGamesEl) totalGamesEl.textContent = gameStats.totalGames.toString();
	if (winsEl) winsEl.textContent = gameStats.wins.toString();
	if (lossesEl) lossesEl.textContent = gameStats.losses.toString();
	if (winRate) winRate.textContent = gameStats.ratio.toFixed(2) + "%"; // Affiche avec 2 décimales et %

	renderStatsChart();
}

/** 🎯 Génère le graphique avec Chart.js */
export function renderStatsChart(): void {
	const ctx = document.getElementById("statsChart") as HTMLCanvasElement;
	if (!ctx) return;

	// 🔥 Vérifie si un graphique existe déjà, et le détruit avant de recréer un nouveau
	if (statsChart) {
		console.log("🗑️ Suppression du graphique existant...");
		statsChart.destroy();
	}

	statsChart = new Chart(ctx, {
		type: "doughnut",
		data: {
			labels: ["Victoires", "Défaites"],
			datasets: [
				{
					data: [gameStats.wins, gameStats.losses],
					backgroundColor: ["#4CAF50", "#FF5252"], // Vert = win, Rouge = lose
				},
			],
		},
	});

	// statsChart = new Chart(ctx, {
	// 	type: "bar",
	// 	data: {
	// 		labels: ["Victoires", "Défaites"],
	// 		datasets: [{
	// 			label: "Stats",
	// 			data: [12],
	// 			backgroundColor: ["#36A2EB", "#FF6384"],
	// 		}]
	// 	},
	// 	options: {
	// 		responsive: true,
	// 		maintainAspectRatio: false,
	// 	}
	// });
	console.log("📊 Nouveau graphique créé !");
}