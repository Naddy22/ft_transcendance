// File: frontend/src/ts/ui.ts

import { registerUser, loginUser } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#registerForm");
  const loginForm = document.querySelector("#loginForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = (document.querySelector("#username") as HTMLInputElement).value;
      const email = (document.querySelector("#email") as HTMLInputElement).value;
      const password = (document.querySelector("#password") as HTMLInputElement).value;
      registerUser(username, email, password);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (document.querySelector("#email") as HTMLInputElement).value;
      const password = (document.querySelector("#password") as HTMLInputElement).value;
      loginUser(email, password);
    });
  }
});
