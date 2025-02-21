/**
 * Manages UI Navigation Between Pages
 */

import { loginUser } from "./api";
import { loadGame } from "./pages/game";

document.getElementById("login-btn")?.addEventListener("click", async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    const result = await loginUser(email, password);
    if (result.token) {
        localStorage.setItem("token", result.token);
        document.getElementById("auth-container")!.style.display = "none";
        document.getElementById("game-container")!.style.display = "block";
    } else {
        alert("Login failed");
    }
});

document.getElementById("back-btn")?.addEventListener("click", () => {
    document.getElementById("game-container")!.style.display = "none";
    document.getElementById("auth-container")!.style.display = "block";
});

document.getElementById("startGame")?.addEventListener("click", () => {
    loadGame();
});
