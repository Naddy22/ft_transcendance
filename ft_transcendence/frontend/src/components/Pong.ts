
export class Pong {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById("pongCanvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
    }

    start() {
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
