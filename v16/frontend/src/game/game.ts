
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { AI } from "./ai";
import { Multiplayer } from "./multiplayer";
import { Matchmaking } from "./matchmaking";
import { Chat } from "./chat";
import { Customization } from "./customization";

export class Game {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private ball: Ball;
    private playerPaddle: Paddle;
    private opponentPaddle: Paddle;
    private ai?: AI;
    private multiplayer?: Multiplayer;
    private matchmaking?: Matchmaking;
    private chat?: Chat;
	private customization?: Customization;
    private running: boolean = false;

    constructor(canvasId: string, multiplayerMode = false, aiMode = false) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.playerPaddle = new Paddle(10, this.canvas.height / 2 - 50);
        this.opponentPaddle = new Paddle(this.canvas.width - 20, this.canvas.height / 2 - 50);

        if (aiMode) {
            this.ai = new AI(this.opponentPaddle, this.ball);
        }

        if (multiplayerMode) {
            this.multiplayer = new Multiplayer();
            this.matchmaking = new Matchmaking();
        }

        this.chat = new Chat();
		this.customization = new Customization();
        this.initListeners();
    }

    private initListeners() {
        window.addEventListener("keydown", (e) => this.playerPaddle.handleInput(e.key));
    }

    public start() {
        this.running = true;
        this.gameLoop();
    }

    private gameLoop() {
        if (!this.running) return;
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    private update() {
        this.ball.update();
        this.playerPaddle.update();
        this.opponentPaddle.update();
        this.ai?.update();
        this.multiplayer?.syncState();
    }

    private render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.context);
        this.playerPaddle.draw(this.context);
        this.opponentPaddle.draw(this.context);
    }
}
