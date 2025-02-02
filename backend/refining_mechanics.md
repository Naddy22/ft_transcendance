
# Refining In-Game Mechanics

> Refine in-game mechanics like scoring, collision detection, and player disconnections.  

---

## Refining In-Game Mechanics

### Scoring System

#### Step 1: Add Scoring Logic

Update the game loop to track when the ball crosses the screen:

```
if game_state[:ball][:x] <= 0
  game_state[:score][:ai] += 1
  reset_ball
elsif game_state[:ball][:x] >= 100
  game_state[:score][:player1] += 1
  reset_ball
end
```

#### Step 2: Reset Ball Position

Add a reset_ball method:

```
def reset_ball
  game_state[:ball] = { x: 50, y: 50, dx: [-1, 1].sample, dy: [-1, 1].sample }
end
```

#### Step 3: Display Score

Send the updated score to all clients in the WebSocket broadcast:

```
clients.each { |client| client.send(game_state.to_json) }
```

---

### Collision Detection

Ensure proper ball collisions with paddles and screen edges:

1. Ball collides with player paddle:
```
if game_state[:ball][:x] <= 5 && 
   (game_state[:ball][:y] - game_state[:paddles][:player1]).abs <= 10
  game_state[:ball][:dx] *= -1
end
```

2. Ball collides with AI paddle (already covered above).


3. Ball collides with top or bottom edges:
```
if game_state[:ball][:y] <= 0 || game_state[:ball][:y] >= 100
  game_state[:ball][:dy] *= -1
end
```

---

### Player Disconnections

#### Handle Disconnections

1. Remove the player’s WebSocket from the clients list:

```
ws.on :close do |_event|
  clients.delete(ws)
  puts "Player disconnected"
end
```

2. Notify remaining players:
```
clients.each { |client| client.send({ message: "Player disconnected" }.to_json) }
```

---

## Testing In-Game Mechanics

1. Open two browser clients:

One as player1.

The other observing AI gameplay.



2. Test scenarios:

Paddle collisions.

Ball scoring and resetting.

Disconnection handling.


---

## Optional Improvements

1. Power-Ups:

Add random power-ups on the field (e.g., increase paddle speed or ball size).

Example:

if game_state[:ball][:x] == 50 && game_state[:ball][:y] == 50
  game_state[:paddles][:player1] += 5
end



2. Multiplayer with Remote Players:

Extend the WebSocket logic to manage more than two players.

Implement custom game modes (e.g., 4-player Pong on a square board).



3. Performance Optimization:

Use EventMachine for asynchronous WebSocket handling.

Reduce the frequency of game state broadcasts if performance becomes an issue.

---

## Next Steps

1. Implement a multiplayer mode (e.g., 3+ players)?


2. Add power-ups and custom game modes?


3. Optimize performance for production deployment?

---
---
