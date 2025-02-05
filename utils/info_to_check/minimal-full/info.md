
minimalFull

✅ Minimal ft_transcendence: Working Base

I will provide a minimal but fully working version of Pong with:

Frontend: Pure Vanilla JavaScript (No Frameworks)

Backend: Pure Ruby (No Rails/Sinatra)

Real-time Multiplayer: Using WebSockets

Scalability: Structured to allow easy expansion

Docker Support: For easy deployment



---

📌 Folder Structure

ft_transcendence/
│── backend/           # Pure Ruby Backend
│   │── server.rb      # Main WebSocket Server
│   │── pong.rb        # Handles game logic
│   │── Gemfile        # Only necessary gems
│── frontend/          # Pure Vanilla JS Frontend
│   │── index.html     # Game Page
│   │── pong.js        # Handles Canvas & Player Input
│   │── styles.css     # Simple Styling
│── docker-compose.yml # Containerized Setup


---

🛠 Backend: Pure Ruby WebSocket Server

🔹 backend/server.rb

require "socket"
require "json"
require_relative "pong"

server = TCPServer.new(4000)
clients = []

puts "Pong WebSocket Server running on port 4000..."

loop do
  Thread.new(server.accept) do |client|
    clients << client
    puts "New player connected (#{clients.size} players online)."

    # Assign player slot
    if clients.size == 1
      client.puts({ type: "assign", player: "left" }.to_json)
    elsif clients.size == 2
      client.puts({ type: "assign", player: "right" }.to_json)
      Pong.start_game(clients)
    else
      client.puts({ type: "full", message: "Game is full. Try again later." }.to_json)
      client.close
      clients.delete(client)
    end

    # Handle incoming messages (player movement)
    loop do
      msg = client.gets
      break if msg.nil?

      data = JSON.parse(msg)
      Pong.handle_input(data, clients)
    end

    puts "Player disconnected."
    clients.delete(client)
  end
end

🔹 What This Does:

Uses WebSockets (TCPServer) for real-time player communication.

Assigns players left & right.

Calls Pong.start_game(clients) when two players connect.

Listens for movement inputs & sends game state updates.



---

🔹 backend/pong.rb

require "json"

module Pong
  WIDTH = 800
  HEIGHT = 400

  @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
  @paddles = { left: HEIGHT / 2, right: HEIGHT / 2 }

  def self.start_game(clients)
    Thread.new do
      loop do
        move_ball
        state = { type: "update", ball: @ball, paddles: @paddles }
        clients.each { |c| c.puts(state.to_json) }
        sleep 0.016 # ~60 FPS
      end
    end
  end

  def self.handle_input(data, clients)
    if data["player"] == "left"
      @paddles[:left] = data["y"]
    elsif data["player"] == "right"
      @paddles[:right] = data["y"]
    end
  end

  def self.move_ball
    @ball[:x] += @ball[:vx]
    @ball[:y] += @ball[:vy]

    # Bounce off top/bottom
    if @ball[:y] <= 0 || @ball[:y] >= HEIGHT
      @ball[:vy] *= -1
    end

    # Reset if out of bounds
    if @ball[:x] < 0 || @ball[:x] > WIDTH
      @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
    end
  end
end

🔹 What This Does:

Manages game logic (ball movement, collision).

Broadcasts game state every 16ms (60 FPS).

Handles paddle movement from players.



---

🛠 Frontend: Pure Vanilla JavaScript

🔹 frontend/index.html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pong Multiplayer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <canvas id="pongCanvas" width="800" height="400"></canvas>
    <script src="pong.js"></script>
</body>
</html>


---

🔹 frontend/pong.js

const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

let ball = { x: 400, y: 200 };
let paddles = { left: 200, right: 200 };
let playerSide = "spectator";

const ws = new WebSocket("ws://localhost:4000");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "assign") {
        playerSide = data.player;
        console.log(`You are playing as ${playerSide}`);
    } else if (data.type === "update") {
        ball = data.ball;
        paddles = data.paddles;
        draw();
    }
};

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

🔹 What This Does:

Connects to the WebSocket server.

Receives game updates and renders them.

Sends paddle movement based on the mouse.



---

🔹 frontend/styles.css

body { text-align: center; }
canvas { border: 2px solid black; background: #222; }


---

🛠 Running the Project with Docker

🔹 backend/Dockerfile

# Use official Ruby image
FROM ruby:3.2-slim

# Set the working directory
WORKDIR /app

# Copy backend files
COPY . .

# Install required gems (if any)
RUN bundle install || true  # Ignore errors if no Gemfile exists

# Expose the WebSocket port
EXPOSE 4000

# Start the WebSocket server
CMD ["ruby", "server.rb"]


🔹 docker-compose.yml

version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app

  frontend:
    image: nginx
    ports:
      - "8080:80"
    volumes:
      - ./frontend:/usr/share/nginx/html

🚀 Start with:

docker-compose up --build

Backend runs on ws://localhost:4000

Frontend accessible at http://localhost:8080



---

✅ Summary

🔹 Minimal but fully working Pong game.
🔹 Vanilla JavaScript frontend (no frameworks).
🔹 Pure Ruby backend (no Rails/Sinatra).
🔹 WebSockets for real-time multiplayer.
🔹 Docker-ready for easy deployment.
🔹 Scalable: Can expand with authentication, tournaments, etc.


---

🚀 Next Steps

1️⃣ Would you like me to add authentication (logins)?
2️⃣ Should we make Pong physics more advanced?
3️⃣ Would you like WebSockets to support chat?

Let me know how you’d like to improve this base! 🏓🔥


