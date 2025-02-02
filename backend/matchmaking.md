
# Matchmaking and Tournament

## Building a Matchmaking System

> Overview  
> The matchmaking system pairs players for a game.  
> It uses a queue to manage waiting players and notifies them when they are matched.

### Implementation

Add Matchmaking Routes  
Update your app.rb:
```
require 'json'
```

Queue to store waiting players
```
queue = []
```

Add player to matchmaking queue
```
post '/matchmaking' do
  data = JSON.parse(request.body.read)
  player = { id: SecureRandom.uuid, username: data['username'] }

  queue << player

  if queue.size >= 2
    # Match the first two players in the queue
    player1, player2 = queue.shift(2)
    { status: 'Matched', players: [player1, player2] }.to_json
  else
    { status: 'Waiting', message: 'Waiting for another player...' }.to_json
  end
end
```

### Test the Matchmaking Endpoint

1. Add a player to the queue:

curl -X POST -H "Content-Type: application/json" -d '{"username":"player1"}' http://localhost:4567/matchmaking


2. Add a second player to see them matched:

curl -X POST -H "Content-Type: application/json" -d '{"username":"player2"}' http://localhost:4567/matchmaking


---
---

## Creating Tournament Brackets

> Overview  
> Tournament brackets organize players into a series of matches.  
> Each round eliminates players until a winner is determined.  

### Implementation

#### Bracket Logic

1. Create a helper function to generate brackets:
```
def create_brackets(players)
  players.shuffle.each_slice(2).to_a
end
```

2. Add a route to handle tournament setup:
```
post '/tournament' do
  data = JSON.parse(request.body.read)
  players = data['players']

  if players.size.even?
    brackets = create_brackets(players)
    { status: 'Tournament Created', brackets: brackets }.to_json
  else
    { status: 'Error', message: 'Number of players must be even.' }.to_json
  end
end
```

#### Test the Tournament Endpoint

1. Create a tournament with players:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"players":["Alice","Bob","Charlie","David"]}' http://localhost:4567/tournament
```

---
---
