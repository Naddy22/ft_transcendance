import { sendPaddlePosition } from "./websockets";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let ball = { x: 150, y: 100, radius: 5 };
let paddle1 = { x: 10, y: 90, width: 10, height: 50 };
let paddle2 = { x: 280, y: 90, width: 10, height: 50 };
let scores = { player1: 0, player2: 0 };
let gameRunning = false; // Prevent multiple loops

export function startGame() {
    if (gameRunning) return; // Prevent multiple loops
    gameRunning = true;
    console.log("Game Started!");

    setInterval(draw, 1000 / 60); // Refresh the screen at 60 FPS
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "white";
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = "16px Arial";
    ctx.fillText(`Player 1: ${scores.player1}`, 50, 20);
    ctx.fillText(`Player 2: ${scores.player2}`, 200, 20);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "w") {
        paddle1.y -= 5;
        sendPaddlePosition(1, paddle1.y);
    } else if (event.key === "s") {
        paddle1.y += 5;
        sendPaddlePosition(1, paddle1.y);
    } else if (event.key === "ArrowUp") {
        paddle2.y -= 5;
        sendPaddlePosition(2, paddle2.y);
    } else if (event.key === "ArrowDown") {
        paddle2.y += 5;
        sendPaddlePosition(2, paddle2.y);
    }
});

// Listen for ball & score updates
export function updateGame(data: any) {
    if (data.type === "update") {
        ball.x = data.ball.x;
        ball.y = data.ball.y;
        scores = data.scores;
    }
}
