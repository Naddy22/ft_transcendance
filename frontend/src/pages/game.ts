/**
 * Integrates Game in SPA
 */

export function loadGame() {
    document.getElementById("game-container")!.innerHTML = `
        <iframe src="http://localhost:8082/index.html" width="600" height="400"></iframe>
    `;
}
