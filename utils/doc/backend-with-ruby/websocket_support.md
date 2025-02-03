

# WebSocket Integration
> (for real-time updates like matchmaking and live chat).

---

## Adding WebSocket Support to the Tournament System

WebSockets enable real-time updates to notify players when they are matched or when a tournament progresses.

### Update Your Dependencies

1. Add the faye-websocket gem:

```
gem 'faye-websocket'
```

Install the gem:

```
bundle install
```

### WebSocket Integration

#### Basic WebSocket Setup

1. Add WebSocket support in `app.rb`:

```rb
require 'faye/websocket'

clients = [] # Store connected WebSocket clients

# WebSocket endpoint
get '/ws' do
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)
    clients << ws

    ws.on :open do |_event|
      puts "WebSocket connection opened"
    end

    ws.on :message do |event|
      # Example: Broadcast messages to all connected clients
      clients.each { |client| client.send(event.data) }
    end

    ws.on :close do |_event|
      puts "WebSocket connection closed"
      clients.delete(ws)
    end

    ws.rack_response
  else
    halt 400, 'WebSocket endpoint only'
  end
end
```

### Testing WebSocket

Use a WebSocket client like websocat:  
`websocat ws://localhost:4567/ws`  

Open multiple websocat connections and send messages to see real-time updates.

---

Matchmaking System with WebSocket

Here’s how you can use WebSockets for matchmaking:

Code Example

require 'faye/websocket'

clients = {} # Track clients and their state

get '/matchmaking' do
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)
    client_id = SecureRandom.uuid
    clients[client_id] = ws

    ws.on :open do |_event|
      puts "Client #{client_id} connected"
      if clients.size >= 2
        # Match two players
        players = clients.keys.sample(2)
        players.each do |id|
          clients[id].send("Matched! Opponent: #{(players - [id]).first}")
        end

        # Remove matched players from the pool
        players.each { |id| clients.delete(id) }
      end
    end

    ws.on :close do |_event|
      puts "Client #{client_id} disconnected"
      clients.delete(client_id)
    end

    ws.rack_response
  else
    halt 400, 'WebSocket endpoint'
  end
end

---

### Notify Players in Matchmaking

Update the /matchmaking route to send notifications:

```
post '/matchmaking' do
  data = JSON.parse(request.body.read)
  player = { id: SecureRandom.uuid, username: data['username'] }

  queue << player

  if queue.size >= 2
    # Match the first two players
    player1, player2 = queue.shift(2)

    # Notify players via WebSocket
    clients.each do |client|
      client.send("Matched: #{player1[:username]} vs #{player2[:username]}")
    end

    { status: 'Matched', players: [player1, player2] }.to_json
  else
    { status: 'Waiting', message: 'Waiting for another player...' }.to_json
  end
end
```

### Notify Tournament Updates

Update the /tournament route:

```
post '/tournament' do
  data = JSON.parse(request.body.read)
  players = data['players']

  if players.size.even?
    brackets = create_brackets(players)

    # Notify clients about the tournament brackets
    clients.each do |client|
      client.send("Tournament Brackets: #{brackets}")
    end

    { status: 'Tournament Created', brackets: brackets }.to_json
  else
    { status: 'Error', message: 'Number of players must be even.' }.to_json
  end
end
```

---

### Testing WebSocket Integration

#### Test the WebSocket

1. Use a WebSocket client like websocat:

```
websocat ws://localhost:4567/ws
```

2. Open multiple websocat instances and send matchmaking or tournament requests to see real-time updates.


#### Test Matchmaking Notifications

1. Start the backend with WebSocket support.


2. Add players to matchmaking using:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"Player1"}' http://localhost:4567/matchmaking
curl -X POST -H "Content-Type: application/json" -d '{"username":"Player2"}' http://localhost:4567/matchmaking
```

3. Watch WebSocket clients receive updates about the matched players.


---
---

## Next Steps

> Expand the WebSocket integration for in-game communication (e.g., ball position in Pong).  
> Add monitoring tools to your Docker setup (e.g., Prometheus/Grafana for logs and metrics).  
> Consider using reverse proxies like NGINX for routing HTTPS traffic to your container.  
> check advanced monitoring tools or integrating WebSocket-driven in-game communication...  
