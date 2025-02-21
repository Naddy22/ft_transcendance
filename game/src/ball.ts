export class Ball {
	x: number;
	y: number;
	radius: number;
	dx: number;
	dy: number;
  
	constructor(canvasWidth: number, canvasHeight: number) {
	  this.x = canvasWidth / 2;
	  this.y = canvasHeight / 2;
	  this.radius = 10;
	  this.dx = Math.random() < 0.5 ? 4 : -4;
	  this.dy = Math.random() < 0.5 ? 3 : -3;
	}
  
	update(canvasHeight: number, leftPaddle: any, rightPaddle: any) {
	  this.x += this.dx;
	  this.y += this.dy;
  
	  // Bounce off top and bottom
	  if (this.y - this.radius <= 0 || this.y + this.radius >= canvasHeight) {
		this.dy *= -1;
	  }
  
	  // Bounce off paddles
	  if (
		(this.x - this.radius <= leftPaddle.x + leftPaddle.width &&
		  this.y > leftPaddle.y &&
		  this.y < leftPaddle.y + leftPaddle.height) ||
		(this.x + this.radius >= rightPaddle.x &&
		  this.y > rightPaddle.y &&
		  this.y < rightPaddle.y + rightPaddle.height)
	  ) {
		this.dx *= -1;
	  }
	}
  
	draw(ctx: CanvasRenderingContext2D) {
	  ctx.fillStyle = "white";
	  ctx.beginPath();
	  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
	  ctx.fill();
	}
  }
  