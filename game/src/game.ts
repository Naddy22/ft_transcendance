/**
 * Handles Game Logic
 */

import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Player } from "./player";

export function startPongGame(): void {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    const ball = new Ball(canvas.width, canvas.height);
    const leftPaddle = new Paddle(10, canvas.height / 2);
    const rightPaddle = new Paddle(canvas.width - 20, canvas.height / 2);
    const leftPlayer = new Player("Player 1");
    const rightPlayer = new Player("Player 2");

    function draw() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ball.draw(ctx);
        leftPaddle.draw(ctx);
        rightPaddle.draw(ctx);
        leftPlayer.drawScore(ctx, 20, 40);
        rightPlayer.drawScore(ctx, canvas.width - 40, 40);
    }

    function update() {
        ball.update(canvas.height, leftPaddle, rightPaddle);
        leftPaddle.update(canvas.height);
        rightPaddle.update(canvas.height);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}
