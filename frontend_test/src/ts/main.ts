// File: frontend/src/main.ts

import "./style.css";

const API_BASE_URL = "https://localhost:3000";
const MATCHMAKING_WS_URL = "wss://localhost:3000/ws/matchmaking";

async function registerUser(username: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  });

  const data = await response.json();
  console.log("User Registered:", data);
}

async function joinMatchmaking(userId: number, username: string) {
  const response = await fetch(`${API_BASE_URL}/matchmaking/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, username })
  });

  const data = await response.json();
  console.log("Matchmaking Response:", data);
}

function connectToMatchmakingWebSocket(userId: number, username: string) {
  const socket = new WebSocket(MATCHMAKING_WS_URL);

  socket.onopen = () => {
    console.log("Connected to matchmaking WebSocket");
    socket.send(JSON.stringify({ event: "join_matchmaking", userId, username }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("WebSocket Message:", data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error:", error);
  };
}
