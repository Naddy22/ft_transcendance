
# Building an AI Player

> Build an AI player for your Pong game.  

---

## Building an AI Player

### Overview  

The AI player will simulate a human opponent by controlling a paddle.  

It will:
	- Track the ball’s position and predict its movement.  
	- Adjust the paddle position to follow the ball.

### Implementation

#### Step 1: Add AI Logic

1. Update your game_state to include the AI paddle:

```
game_state = {
  players: ['player1', 'AI'],
  ball: { x: 50, y: 50, dx: 1, dy: 1 },
  paddles: { player1: 40, ai: 40 },
  score: { player1: 0, ai: 0 }
}
```

2. Define a function to simulate AI behavior:

```
def update_ai_paddle
  ai_position = game_state[:paddles][:ai]
  ball_position = game_state[:ball][:y]

  if ai_position < ball_position
    game_state[:paddles][:ai] += 2 # Move AI paddle down
  elsif ai_position > ball_position
    game_state[:paddles][:ai] -= 2 # Move AI paddle up
  end

  # Ensure paddle stays within bounds
  game_state[:paddles][:ai] = [[game_state[:paddles][:ai], 0].max, 100].min
end
```

---

#### Step 2: Integrate AI Paddle Updates

1. Update the game loop to call update_ai_paddle periodically:

```
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

    # Update AI paddle position
    update_ai_paddle

    # Broadcast the updated game state to all clients
    clients.each { |client| client.send(game_state.to_json) }
  end
end
```

---

#### Step 3: AI Paddle Collision

Update the ball’s dx direction when it hits the AI paddle:

if game_state[:ball][:x] >= 95 && 
   (game_state[:ball][:y] - game_state[:paddles][:ai]).abs <= 10
  game_state[:ball][:dx] *= -1
end


---

#### Step 4: Test the AI

1. Start the backend:

```
ruby app.rb
```

2. Connect to the game as player1 using WebSocket.


3. Watch the AI paddle follow the ball in real-time.


---
