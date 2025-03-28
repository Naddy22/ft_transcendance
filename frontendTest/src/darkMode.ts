// File: frontend/src/darkMode.ts

export function setupDarkMode() {
  const darkModeBtn = document.getElementById("toggleDarkMode") as HTMLButtonElement;
  if (!darkModeBtn) {
    console.error("Dark mode button not found");
    return;
  }

  function setDarkMode(enabled: boolean) {
    document.body.classList.toggle("dark-mode", enabled);
    localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");
    darkModeBtn.textContent = enabled ? "☀️ Light Mode" : "🌙 Dark Mode";
  }

  // Initialize dark mode based on localStorage
  setDarkMode(localStorage.getItem("darkMode") === "enabled");

  // Attach event listener to toggle dark mode on click
  darkModeBtn.addEventListener("click", () => {
    setDarkMode(!document.body.classList.contains("dark-mode"));
  });
}
