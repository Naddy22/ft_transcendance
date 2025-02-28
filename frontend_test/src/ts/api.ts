// File: frontend/src/api.ts

const API_URL = "https://localhost:3000"; // Ensure HTTPS and -k flag for curl

export async function postData(endpoint: string, data: object) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}


// export async function registerUser(username: string, email: string, password: string) {
//   const response = await fetch(`${API_URL}/auth/register`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, email, password }),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to register: ${await response.text()}`);
//     // throw new Error(`Failed to register: ${response.statusText}`);
//   }

//   return response.json();
// }

// export async function loginUser(email: string, password: string) {
//   const response = await fetch(`${API_URL}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   if (!response.ok) {
//     throw new Error(`Login failed: ${await response.text()}`);
//     // throw new Error(`Login failed: ${response.statusText}`);
//   }

//   return response.json();
// }

// export async function getUsers() {
//   const response = await fetch(`${API_URL}/users/`);
//   return response.json();
// }

// Expose functions globally for easy debugging in browser console
// (window as any).api = { registerUser, loginUser, getUsers };
