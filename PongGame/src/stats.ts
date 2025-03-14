import Chart from "chart.js/auto"; // 📊 pour graphique
import { API, UserStats } from "./api";

const api = new API("https://localhost:3000");

let statsChart: Chart | null = null; // Variable pour stocker le graphique

export function addGameToStats(userId: number, result: "Victoire" | string): void {
	const statsIncrement = result.includes("Victoire")
		? { wins: 1, losses: 0, matchesPlayed: 1 }
		: { wins: 0, losses: 1, matchesPlayed: 1 };

	api.updateUserStats(userId, statsIncrement)
		.then((res) => {
			console.log("✅ Stats utilisateur mises à jour :", res.message);
		})
		.catch((error) => {
			console.error("❌ Erreur lors de la mise à jour des stats :", error.message);
		});
}

export function updateStatsUI(userId: number): void {
	api.getUserStats(userId)
		.then((stats: UserStats) => {
			const totalGames = stats.matchesPlayed;
			const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;

			const totalGamesEl = document.getElementById("totalGames") as HTMLElement;
			const winsEl = document.getElementById("wins") as HTMLElement;
			const lossesEl = document.getElementById("losses") as HTMLElement;
			const winRateEl = document.getElementById("winRate") as HTMLElement;

			if (totalGamesEl) totalGamesEl.textContent = totalGames.toString();
			if (winsEl) winsEl.textContent = stats.wins.toString();
			if (lossesEl) lossesEl.textContent = stats.losses.toString();
			if (winRateEl) winRateEl.textContent = winRate.toFixed(2) + "%";

			renderStatsChart(stats);
		})
		.catch((error) => {
			console.error("❌ Erreur lors de la mise à jour des stats :", error.message);
		});
}



// /** A changé apres pour l'endroit ou stocker dans le backend */
// let gameStats = {
// 	totalGames: 0,
// 	wins: 0,
// 	losses: 0,
// 	ratio: 0,
// };

// let statsChart: Chart | null = null; // Variable pour stocker le graphique

// /* Ajoute une partie aux statistiques */
// export function addGameToStats(result: string): void {
// 	gameStats.totalGames++;

// 	if (result === "Victoire") {
// 		gameStats.wins++;
// 	} else {
// 		gameStats.losses++;
// 	}

// 	gameStats.ratio = gameStats.totalGames > 0 ? (gameStats.wins / gameStats.totalGames) * 100 : 0;

// 	console.log("📊 Statistiques mises à jour (local)", gameStats);
// }

// /* Met à jour l'affichage des stats dans la modal */
// export function updateStatsUI(): void {
// 	const totalGamesEl = document.getElementById("totalGames") as HTMLElement;
// 	const winsEl = document.getElementById("wins") as HTMLElement;
// 	const lossesEl = document.getElementById("losses") as HTMLElement;
// 	const winRate = document.getElementById("winRate") as HTMLElement;

// 	if (totalGamesEl) totalGamesEl.textContent = gameStats.totalGames.toString();
// 	if (winsEl) winsEl.textContent = gameStats.wins.toString();
// 	if (lossesEl) lossesEl.textContent = gameStats.losses.toString();
// 	if (winRate) winRate.textContent = gameStats.ratio.toFixed(2) + "%"; // Affiche avec 2 décimales et %

// 	renderStatsChart();
// }

/** 🎯 Génère le graphique avec Chart.js */
export function renderStatsChart(stats: UserStats): void {
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
					data: [stats.wins, stats.losses],
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