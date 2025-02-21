/**
 * Handles Backend Communication
 */

const API_BASE = "http://localhost:3000/auth";

export async function loginUser(email: string, password: string) {
    const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return await response.json();
}
