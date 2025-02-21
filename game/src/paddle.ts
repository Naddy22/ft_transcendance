export class Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	movingUp: boolean;
	movingDown: boolean;
  
	constructor(x: number, y: number) {
	  this.x = x;
	  this.y = y - 50;
	  this.width = 10;
	  this.height = 100;
	  this.speed = 4;
	  this.movingUp = false;
	  this.movingDown = false;
	}
  
	update(canvasHeight: number) {
	  if (this.movingUp && this.y > 0) {
		this.y -= this.speed;
	  }
	  if (this.movingDown && this.y + this.height < canvasHeight) {
		this.y += this.speed;
	  }
	}
  
	draw(ctx: CanvasRenderingContext2D) {
	  ctx.fillStyle = "white";
	  ctx.fillRect(this.x, this.y, this.width, this.height);
	}
  }
  