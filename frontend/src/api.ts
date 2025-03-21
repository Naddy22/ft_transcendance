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
  twoFactorCode?: string | null;
}

export interface LogoutRequest {
  id: number;
}

export type UserStatus = "online" | "offline" | "in-game" | "anonymized";

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  status: UserStatus;
  wins: number;
  losses: number;
  matchesPlayed: number;
  isTwoFactorEnabled: boolean;
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface UserStatsUpdate {
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
}

export interface UserStats {
  wins: number;
  losses: number;
  matchesPlayed: number;
  winRatio: number;
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
  matchType: "1vs1" | "vs AI" | "Tournament";
  tournamentId?: number | null;
}

export interface MatchHistory {
  date: string;
  type: "1vs1" | "vs AI" | "Tournament";
  result: string;
}

export interface NewMatchHistoryEntry {
  userId: number;
  type: "1vs1" | "vs AI" | "Tournament";
  result: string;
}

// export type MatchHistoryEntry = Pick<Match, "startTime" | "matchType" | "winner">;

export interface NewMatchRequest {
  player1: number;
  player2: number;
  score: MatchScore;
  startTime: string;
  matchType: "1vs1" | "vs AI" | "Tournament";
  tournamentId?: number | null;

}

export interface MatchUpdateRequest {
  winner?: number;
  score?: MatchScore;
  endTime?: string;
}

export interface MatchResultRequest {
  matchId: number;
  winner: number;
  score?: MatchScore;
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

export type NewTournamentRequest = Pick<Tournament, "name" | "players">;
export type TournamentUpdateRequest = Partial<Pick<Tournament, "status" | "winner">>;

export interface HealthResponse {
  status: string;
}

// ─── API Client Class ──────────────────────────────────────────────

export class API {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    // Set to the backend URL (e.g., "https://localhost:3000")
    this.baseUrl = baseUrl;
  }

  // Generic request method with centralized error handling.
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      ...options,
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Clear token if unauthorized
      // if (response.status === 401) {
      //   localStorage.removeItem('token');
      // }
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

  // async loginUser(
  //   data: LoginRequest
  // ): Promise<{ message: string; user: PublicUser }> {
  //   return this.request<{ message: string; user: PublicUser }>("/auth/login", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  // }

  // Login with 2FA support
  async loginUser(
    data: LoginRequest
  ): Promise<{ message: string; user?: PublicUser; requires2FA?: boolean }> {
    const response = await this.request<{ message: string; token?: string; user?: PublicUser; requires2FA?: boolean }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // If the login response contains a token, save it
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    }

    return response;
  }

  async logoutUser(data: LogoutRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Clear token on logout
    localStorage.removeItem('token');
    return response;
  }

  // ── User Endpoints ──────────────────────────────────────────────

  async getUsers(): Promise<PublicUser[]> {
    return this.request<PublicUser[]>("/users");
    // const users = await this.request<PublicUser[]>("/users");

    // return users.map(user => ({
    //   ...user,
    //   avatar: user.avatar
    //     ? (user.avatar === "default_cat.webp"
    //       ? `/avatars/default/${user.avatar}`
    //       : `/avatars/uploads/${user.avatar}`)
    //     : `/avatars/default/default_cat.webp`
    // }));
  }

  async getUser(id: number): Promise<PublicUser> {
    return this.request<PublicUser>(`/users/${id}`);
    // const user = await this.request<PublicUser>(`/users/${id}`);

    // if (user.avatar) {
    //   user.avatar = user.avatar === "default_cat.webp"
    //     ? `/avatars/default/${user.avatar}`
    //     : `/avatars/uploads/${user.avatar}`;
    // } else {
    //   user.avatar = `/avatars/default/default_cat.webp`;
    // }

    // return user;
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

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
      // Ensuring no empty body is sent
      headers: {}, // Removing `Content-Type`
    });
  }

  // ── User Stats Endpoints ──────────────────────────────────────────

  // Update user stats by incrementing values
  async updateUserStats(userId: number, stats: Partial<UserStats>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/stats`, {
      method: "PUT",
      body: JSON.stringify(stats),
    });
  }

  // Retrieve user stats from the backend
  async getUserStats(userId: number): Promise<UserStats> {
    return this.request<UserStats>(`/users/${userId}/stats`);
  }

  // ── Friend Endpoints ──────────────────────────────────────────────

  // Get friend list for a user
  async getFriends(userId: number): Promise<PublicUser[]> {
    return this.request<PublicUser[]>(`/users/${userId}/friends`);
  }

  // Add a friend
  async addFriend(userId: number, friendId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/friends`, {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  }

  // Remove a friend
  async removeFriend(userId: number, friendId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/friends/${friendId}`, {
      method: "DELETE",
      // Override headers so that Content-Type isn't sent
      headers: {}
    });
  }

  // ── Matches Endpoints ──────────────────────────────────────────────

  async getMatches(): Promise<Match[]> {
    return this.request<Match[]>("/matches");
  }

  async getMatch(matchId: number): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`);
  }

  async createMatch(data: NewMatchRequest): Promise<{ message: string; matchId: number }> {
    return this.request<{ message: string; matchId: number }>("/matches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMatch(matchId: number, data: MatchUpdateRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/matches/${matchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async submitMatchResult(data: MatchResultRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>("/matches/result", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserMatchHistory(userId: number): Promise<MatchHistory[]> {
    return this.request<MatchHistory[]>(`/matches/history/${userId}`);
  }

  // async submitMatchResult(data: { matchId: number; winner: number; scorePlayer1?: number; scorePlayer2?: number }): Promise<{ message: string }> {
  //   return this.request<{ message: string }>("/matches/result", {
  //     method: "POST",
  //     body: JSON.stringify(data),
  //   });
  // }

  // ── Match History Endpoint ────────────────────────────────────────────

  // Create a new match history entry
  async createMatchHistoryEntry(data: NewMatchHistoryEntry): Promise<{ message: string; id: number }> {
    return this.request<{ message: string; id: number }>("/matchHistory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get match history for a user
  async getMatchHistory(userId: number): Promise<MatchHistory[]> {
    return this.request<MatchHistory[]>(`/matchHistory/${userId}`);
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

  async createTournament(data: NewTournamentRequest): Promise<{ message: string; tournamentId: number }> {
    return this.request<{ message: string; tournamentId: number }>("/tournaments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTournament(id: number, data: TournamentUpdateRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tournaments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ── Avatar Endpoints ──────────────────────────────────────────────────

  // Upload avatar (expects a FormData object, so do not set Content-Type manually)
  async uploadAvatar(formData: FormData): Promise<{ message: string; avatarUrl: string }> {

    // Retrieve token from localStorage
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/avatars`, {
      method: "POST",
      headers,
      body: formData, // Browser sets the Content-Type automatically
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || response.statusText;
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }
    return data;
  }

  // Update avatar reference in the database
  async updateAvatar(userId: number, avatarUrl: string): Promise<{ message: string; avatarUrl: string }> {
    return this.request<{ message: string; avatarUrl: string }>(`/avatars`, {
      method: "PUT",
      body: JSON.stringify({ userId, avatarUrl }),
    });
  }

  // Remove avatar (revert to default)
  async removeAvatar(userId: number): Promise<{ message: string; avatarUrl: string }> {
    return this.request<{ message: string; avatarUrl: string }>(`/avatars`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  }

  // ── Anonymisation ─────────────────────────────────────────────────────

  // Anonymize user data
  async anonymizeUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/anonymize`, {
      method: "PUT",
      // Override headers so that Content-Type isn't sent
      headers: {}
    });
  }

  // Export user data 
  async exportUserData(userId: number): Promise<any> {
    return this.request<any>(`/users/${userId}/export`, {
      method: "GET",
    });
  }

  // ── 2FA ───────────────────────────────────────────────────────────────

  // Setup 2FA
  // async setup2FA(userId: number): Promise<{ secret: string; qrCode: string }> {
  //   return this.request<{ secret: string; qrCode: string }>(`/auth/setup-2fa`, {
  //     method: "POST",
  //     body: JSON.stringify({ userId }),
  //   });
  // }
  // async setup2FA(userId: number): Promise<Setup2FAResponse> {
  //   return this.request<Setup2FAResponse>("/auth/setup-2fa", {
  //     method: "POST",
  //     body: JSON.stringify({ userId }),
  //   });
  // }
  async setup2FA(userId: number): Promise<{ secret: string; qrCode: string }> {
    const response = await this.request<{ secret: string; qrCode: string }>(`/auth/setup-2fa`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    console.log("Saved 2FA Secret:", response.secret); // ✅ Check this
    return response;
  }

  // Verify 2FA Token
  async verify2FA(userId: number, token: string): Promise<{ message: string; token?: string }> {
    return this.request<{ message: string; token?: string }>(`/auth/verify-2fa`, {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    });
  }

  // Disable 2FA
  async disable2FA(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/disable-2fa", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  // // Send 2FA Code via Email
  // async send2FACode(userId: number, email: string): Promise<{ message: string }> {
  //   return this.request<{ message: string }>("/auth/send-2fa-code", {
  //     method: "POST",
  //     body: JSON.stringify({ userId, email }),
  //   });
  // }

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

/*
import { API } from "./api";

const api = new API("https://localhost:3000"); // Adjust as needed

async function loadUserHistory(userId: number) {
  try {
    const history = await api.getUserMatchHistory(userId);
    history.forEach(({ date, type, result }) => addGameToHistory(type, result));
  } catch (error) {
    console.error("Failed to load game history:", error);
  }
}

// Example Usage:
const userId = 1; // Replace with actual user ID
loadUserHistory(userId);
*/
