
# WebSocket-Driven In-Game Communication

> Integrate WebSocket-driven in-game communication for real-time Pong gameplay.

---

## WebSocket-Driven In-Game Communication

> Overview  
> WebSockets allow real-time updates for in-game actions like paddle movement, ball position, and scores.


---

### Implement Real-Time Pong Communication

#### Step 1: Define Game State

Store the game state (e.g., paddle positions, ball position) in memory:

```
game_state = {
  players: [],
  ball: { x: 50, y: 50, dx: 1, dy: 1 },
  paddles: { player1: 40, player2: 40 }
}
```

---

#### Step 2: Update WebSocket Logic

1. Notify players of the current state:

```
require 'json'

get '/game_ws' do
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)

    ws.on :open do |_event|
      # Send initial game state
      ws.send(game_state.to_json)
    end

    ws.on :message do |event|
      data = JSON.parse(event.data)

      # Update paddle positions
      if data['player'] == 'player1'
        game_state[:paddles][:player1] = data['paddle_position']
      elsif data['player'] == 'player2'
        game_state[:paddles][:player2] = data['paddle_position']
      end
    end

    ws.on :close do |_event|
      puts "WebSocket connection closed"
    end

    ws.rack_response
  else
    halt 400, 'WebSocket endpoint only'
  end
end
```

---

#### Step 3: Update Ball Position Periodically

Add a periodic timer to update the ball position:

```
require 'eventmachine'

Thread.new do
  loop do
    sleep 0.05

    # Update ball position
    game_state[:ball][:x] += game_state[:ball][:dx]
    game_state[:ball][:y] += game_state[:ball][:dy]

    # Check for collisions
    if game_state[:ball][:y] <= 0 || game_state[:ball][:y] >= 100
      game_state[:ball][:dy] *= -1
    end

    # Broadcast the updated game state to all clients
    clients.each { |client| client.send(game_state.to_json) }
  end
end
```

---

#### Step 4: Client Integration

1. Connect to the WebSocket:

```
const ws = new WebSocket("ws://localhost:4567/game_ws");

ws.onmessage = (event) => {
  const gameState = JSON.parse(event.data);
  console.log("Updated game state:", gameState);
};

// Send paddle position
document.addEventListener("mousemove", (e) => {
  ws.send(JSON.stringify({ player: "player1", paddle_position: e.clientY }));
});
```

2. Render the game state in the browser:

Update the canvas based on received game state.

---

### Testing In-Game Communication

1. Start the backend:

```bash
ruby app.rb
```

2. Open multiple browser clients and connect to /game_ws.


3. Move paddles and watch the real-time synchronization.

---

## Next Steps

Refine game mechanics:
	- Add scoring logic.  
	- Handle player disconnections.

Implement AI to simulate a player.

Add monitoring for WebSocket events.  
check building the AI player or refining the in-game mechanics...  

