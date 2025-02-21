/**
 * Profile & Matchmaking
 */

export function loadProfile() {
    const container = document.getElementById("profile-container");
    if (container) {
        container.innerHTML = `<h2>Your Profile</h2>`;
    }
}
