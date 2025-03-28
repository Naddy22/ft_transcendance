// File: frontend/src/stats.ts
// (wip) fixed version using the database and api

import Chart from "chart.js/auto";
import { API, UserStats } from "./api";

// const api = new API("https://localhost:3000");
const api = new API("");

let statsChart: Chart | null = null;

/**
 * Update the user's stats on the backend.
 * If the result is "Victoire", we increment wins and matchesPlayed.
 * Otherwise, we increment losses and matchesPlayed.
 */
export async function addGameToStats(userId: number, result: "Victoire" | string): Promise<void> {
  // Define the increments. For example, 1 game is played always,
  // and win increments wins by 1 while loss increments losses by 1.
  const statsIncrement = result.includes("Victoire")
    ? { wins: 1, losses: 0, matchesPlayed: 1 }
    : { wins: 0, losses: 1, matchesPlayed: 1 };

  try {
    const res = await api.updateUserStats(userId, statsIncrement);
    console.log("User stats updated:", res.message);
  } catch (error: any) {
    console.error("Error updating user stats:", error.message);
  }
}

/**
 * Fetch the updated stats from the backend and update the UI.
 */
export async function updateStatsUI(userId: number): Promise<void> {
  try {
    const stats: UserStats = await api.getUserStats(userId);
    const totalGames = stats.matchesPlayed;
    // const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;

    const totalGamesEl = document.getElementById("totalGames") as HTMLElement;
    const winsEl = document.getElementById("wins") as HTMLElement;
    const lossesEl = document.getElementById("losses") as HTMLElement;
    const winRateEl = document.getElementById("winRate") as HTMLElement;

    if (totalGamesEl) totalGamesEl.textContent = totalGames.toString();
    if (winsEl) winsEl.textContent = stats.wins.toString();
    if (lossesEl) lossesEl.textContent = stats.losses.toString();
    if (winRateEl) winRateEl.textContent = stats.winRatio.toFixed(2) + "%";

    renderStatsChart(stats);
  } catch (error: any) {
    console.error("Error updating stats UI:", error.message);
  }
}

/**
 * Generate and render the statistics chart using Chart.js.
 */
export function renderStatsChart(stats: UserStats): void {
  const ctx = document.getElementById("statsChart") as HTMLCanvasElement;
  if (!ctx) return;

  // If a chart already exists, destroy it before creating a new one.
  if (statsChart) {
    console.log("Deleting existing chart...");
    statsChart.destroy();
  }

  statsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Victoires", "Défaites"],
      datasets: [
        {
          data: [stats.wins, stats.losses],
          backgroundColor: ["#4CAF50", "#FF5252"],
        },
      ],
    },
  });

  console.log("New stats chart created!");
}
