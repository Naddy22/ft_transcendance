
/**
 * API class for handling backend communication.
 * Uses a helper function `request` to simplify fetch operations.
 */
export class API {
  /**
   * Generic helper function for making API requests.
   * @param endpoint - API endpoint (e.g., "/users")
   * @param method - HTTP method (GET, POST, PUT, DELETE)
   * @param body - Request body (optional)
   * @returns Parsed JSON response or null in case of an error.
   */
  private static async request(endpoint: string, method: string = "GET", body?: any): Promise<any> {
    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body && { body: JSON.stringify(body) }), // Only add body if it's provided
      };

      const response = await fetch(endpoint, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred.");
      }

      return response.json();
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error.message);
      return null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────────
  // API Endpoints

  /** Fetch all users */
  static fetchUsers() {
    return this.request("/users");
  }

  /** Fetch user info by ID */
  static fetchUserInfo(userId: number) {
    return this.request(`/users/${userId}`);
  }

  /** Register a new user */
  static registerUser(username: string, email: string, password: string) {
    return this.request("/auth/register", "POST", { username, email, password });
  }

  /** Login user */
  static loginUser(identifier: string, password: string) {
    return this.request("/auth/login", "POST", { identifier, password });
  }

  /** Logout user */
  static logoutUser(userId: number) {
    return this.request("/auth/logout", "POST", { id: userId });
  }

  /** Delete user account */
  static deleteAccount(userId: number) {
    return this.request(`/users/${userId}`, "DELETE");
  }

  /** Update user profile (username, email, status) */
  static updateUser(userId: number, data: Record<string, any>) {
    return this.request(`/users/${userId}`, "PUT", data);
  }
}

// To call an API, you can just do:

// const users = await API.fetchUsers();
// const user = await API.fetchUserInfo(1);
// await API.registerUser("JohnDoe", "john@example.com", "password123");
