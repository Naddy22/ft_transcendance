// frontend/src/auth.ts

import { postData } from "./api.js";

// Register User
export async function registerUser(username: string, email: string, password: string) {
  const response = await postData("auth/register", { username, email, password });
  if (response.error) {
    alert(response.error);
  } else {
    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
  }
}

// Login User
export async function loginUser(email: string, password: string) {
  const response = await postData("auth/login", { email, password });
  if (response.error) {
    alert(response.error);
  } else {
    localStorage.setItem("user", JSON.stringify(response.user));
    window.location.href = "dashboard.html";
  }
}

// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("auth-form") as HTMLFormElement;
//   const usernameField = document.getElementById("username") as HTMLInputElement;
//   const emailField = document.getElementById("email") as HTMLInputElement;
//   const passwordField = document.getElementById("password") as HTMLInputElement;
//   const toggleFormLink = document.getElementById("toggle-form") as HTMLAnchorElement;
//   const statusMessage = document.getElementById("status-message") as HTMLParagraphElement;
//   const formTitle = document.getElementById("form-title") as HTMLHeadingElement;
//   const submitButton = form.querySelector("button") as HTMLButtonElement;

//   let isLogin = true; // Track login/register mode

//   toggleFormLink.addEventListener("click", (e) => {
//     e.preventDefault();
//     isLogin = !isLogin;
//     formTitle.textContent = isLogin ? "Login" : "Register";
//     submitButton.textContent = isLogin ? "Login" : "Register";
//     usernameField.classList.toggle("hidden", isLogin);
//     toggleFormLink.textContent = isLogin ? "Create an account" : "Already have an account?";
//   });

//   form.addEventListener("submit", async (event) => {
//     event.preventDefault();
//     statusMessage.textContent = ""; // Clear status message

//     const username = usernameField.value.trim();
//     const email = emailField.value.trim();
//     const password = passwordField.value.trim();

//     try {
//       if (isLogin) {
//         const result = await (window as any).api.loginUser(email, password);
//         statusMessage.textContent = `✅ Logged in as ${result.user.username}`;
//         statusMessage.classList.remove("text-red-500");
//         statusMessage.classList.add("text-green-500");
//       } else {
//         const result = await (window as any).api.registerUser(username, email, password);
//         statusMessage.textContent = `✅ Registered successfully!`;
//         statusMessage.classList.remove("text-red-500");
//         statusMessage.classList.add("text-green-500");
//       }
//     } catch (error: any) {
//       statusMessage.textContent = `❌ ${error.message}`;
//       statusMessage.classList.remove("text-green-500");
//       statusMessage.classList.add("text-red-500");
//     }
//   });
// });
