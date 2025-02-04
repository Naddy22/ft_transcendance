
import { Paddle } from "./paddle";
import { Ball } from "./ball";

export class AI {
    private paddle: Paddle;
    private ball: Ball;

    constructor(paddle: Paddle, ball: Ball) {
        this.paddle = paddle;
        this.ball = ball;
    }

    public update() {
        if (this.ball.y < this.paddle.y) {
            this.paddle.moveUp();
        } else if (this.ball.y > this.paddle.y + this.paddle.height) {
            this.paddle.moveDown();
        }
    }
}
