// File: frontend/src/toggle.ts

import { toggleForms } from "./toggleUtils";

/**
 * Setup toggling between login and register forms.
 * When one form is shown, the other is automatically hidden and its button text is reset.
 */
export function setupToggleLoginRegister() {
  const toggleLogin = document.getElementById("toggleLogin") as HTMLButtonElement;
  const toggleRegister = document.getElementById("toggleRegister") as HTMLButtonElement;
  const loginForm = document.getElementById("loginForm") as HTMLDivElement;
  const registerForm = document.getElementById("registerForm") as HTMLDivElement;

  toggleLogin.addEventListener("click", () => {
    toggleForms(
      loginForm, toggleLogin, "Show Login", "Hide Login",
      registerForm, toggleRegister, "Show Register"
    );
  });

  toggleRegister.addEventListener("click", () => {
    toggleForms(
      registerForm, toggleRegister, "Show Register", "Hide Register",
      loginForm, toggleLogin, "Show Login"
    );
  });
}
