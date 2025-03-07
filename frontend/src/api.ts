// frontend/src/api.ts

// ─── Type Definitions ──────────────────────────────────────────────

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LogoutRequest {
  id: number;
}

export type UserStatus = "online" | "offline" | "in-game";

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  status: UserStatus;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface MatchScore {
  player1: number;
  player2: number;
}

export interface Match {
  matchId: number;
  player1: number;
  player2: number;
  winner?: number | null;
  score: MatchScore;
  startTime: string;
  endTime?: string | null;
  tournamentId?: number | null;
}

export interface MatchmakingRequest {
  userId: number;
  username: string;
}

export interface MatchmakingResponse {
  matchId: number;
  player1: { id: number; username: string };
  player2: { id: number; username: string };
  status: "waiting" | "started";
}

export interface Tournament {
  tournamentId: number;
  name: string;
  players: number[];
  matches: Match[];
  winner?: number | null;
  status: "pending" | "in-progress" | "completed";
}

export interface HealthResponse {
  status: string;
}

// ─── API Client Class ──────────────────────────────────────────────

export class API {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    // The baseUrl should be set to the backend URL. For example, "https://localhost:3000"
    this.baseUrl = baseUrl;
  }

  // Generic request method with centralized error handling.
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Preserve detailed error messages from the backend
      const errorMessage = responseData.error || response.statusText;
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    return responseData;
  }

  // ── Health Check ──────────────────────────────────────────────

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  // ── Auth Endpoints ──────────────────────────────────────────────

  async registerUser(data: RegisterRequest): Promise<PublicUser> {
    return this.request<PublicUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async loginUser(
    data: LoginRequest
  ): Promise<{ message: string; user: PublicUser }> {
    return this.request<{ message: string; user: PublicUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logoutUser(data: LogoutRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── User Endpoints ──────────────────────────────────────────────

  async getUsers(): Promise<PublicUser[]> {
    return this.request<PublicUser[]>("/users");
  }

  async getUser(id: number): Promise<PublicUser> {
    return this.request<PublicUser>(`/users/${id}`);
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest
  ): Promise<{ message: string; user: PublicUser }> {
    return this.request<{ message: string; user: PublicUser }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // ── Matches Endpoints ──────────────────────────────────────────────

  async getMatches(): Promise<Match[]> {
    return this.request<Match[]>("/matches");
  }

  async getMatch(matchId: number): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`);
  }

  // ── Matchmaking Endpoint ──────────────────────────────────────────────

  async joinMatchmaking(
    data: MatchmakingRequest
  ): Promise<MatchmakingResponse> {
    return this.request<MatchmakingResponse>("/matchmaking/join", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ── Tournament Endpoints ──────────────────────────────────────────────

  async getTournaments(): Promise<Tournament[]> {
    return this.request<Tournament[]>("/tournaments");
  }

  async getTournament(id: number): Promise<Tournament> {
    return this.request<Tournament>(`/tournaments/${id}`);
  }
}

/*
// Example usage in a frontend component or module

import { API } from "./api";

const API = new API("https://your-backend-url.com");

async function handleLogin() {
  try {
    const loginData = { identifier: "user@example.com", password: "secret123" };
    const response = await API.loginUser(loginData);
    console.log("Logged in user:", response.user);
  } catch (error: any) {
    console.error("Login failed:", error.message);
  }
}

handleLogin();
*/
