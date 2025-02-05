
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

let ball = { x: 400, y: 200 };
let paddles = { left: 200, right: 200 };
let playerSide = "spectator";

// Ensure WebSocket connects to the correct address inside Docker
const ws = new WebSocket(`ws://${window.location.hostname}:4000`);

ws.onopen = () => {
    console.log("✅ Connected to WebSocket server");
};

ws.onerror = (error) => {
    console.error("❌ WebSocket error:", error);
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "assign") {
            playerSide = data.player;
            console.log(`🎮 You are playing as ${playerSide}`);
        } else if (data.type === "update") {
            ball = data.ball;
            paddles = data.paddles;
            draw();
        }
    } catch (e) {
        console.error("❌ Error parsing WebSocket message:", event.data);
    }
};

// Send paddle movement
canvas.addEventListener("mousemove", (event) => {
    if (playerSide !== "spectator") {
        const paddleY = (event.clientY / window.innerHeight) * 400;
        ws.send(JSON.stringify({ player: playerSide, y: paddleY }));
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillRect(20, paddles.left - 40, 10, 80);
    ctx.fillRect(770, paddles.right - 40, 10, 80);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fill();
}

// What This Does:
// Connects to the WebSocket server.
// Receives game updates and renders them.
// Sends paddle movement based on the mouse.
