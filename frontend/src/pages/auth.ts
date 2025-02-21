/**
 * User Authentication
 */

import { loginUser } from "../api";

document.getElementById("login-btn")?.addEventListener("click", async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    const result = await loginUser(email, password);
    if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "#profile";
    } else {
        alert("Login failed");
    }
});
