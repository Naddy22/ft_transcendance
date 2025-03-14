// File: frontend/src/history.ts
// Fixed version using database and backend api

import { API, MatchHistory, NewMatchHistoryEntry } from "./api";

const api = new API("https://localhost:3000");

export async function addGameToHistory(
  userId: number,
  type: "1vs1" | "vs AI" | "Tournament",
  result: string
): Promise<void> {
  try {
    const data: NewMatchHistoryEntry = { userId, type, result };
    const res = await api.createMatchHistoryEntry(data);
    console.log("History entry added with ID:", res.id);

    updateHistoryUI(userId);
  } catch (error: any) {
    console.error("Error adding match history entry:", error.message);
  }
}

// Update the UI by fetching the match history from the backend:
export async function updateHistoryUI(userId: number): Promise<void> {
  const historyList = document.getElementById("gameHistoryList") as HTMLUListElement;
  if (!historyList) return;

  try {
    const historyEntries: MatchHistory[] = await api.getMatchHistory(userId);
    historyList.innerHTML = "";
    historyEntries.forEach(({ date, type, result }) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${new Date(date).toLocaleString()} - ${type} : ${result}`;
      historyList.appendChild(listItem);
    });
  } catch (error: any) {
    console.error("Error updating history UI:", error.message);
  }
}
