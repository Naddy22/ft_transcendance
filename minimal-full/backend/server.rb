
# Pure Ruby WebSocket Server

require "socket"
require "json"
require "thread"

server = TCPServer.new(4000)
clients = []

puts "🚀 Pong WebSocket Server running on port 4000..."

loop do
  Thread.new(server.accept) do |client|
    request = client.gets
    if request.nil?
      puts "⚠️ Empty request received, closing connection."
      client.close
      next
    end

    if request.match(/Upgrade: websocket/)
      puts "✅ WebSocket connection established"
      client.puts "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n"
    else
      puts "❌ Received non-WebSocket request. Closing connection."
      client.puts "HTTP/1.1 400 Bad Request\r\n\r\n"
      client.close
      next
    end

    clients << client
    puts "🎮 New player connected (#{clients.size} players online)."

    # Assign players
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

    # Handle incoming messages
    loop do
      msg = client.gets
      break if msg.nil?

      begin
        data = JSON.parse(msg.strip)
        Pong.handle_input(data, clients)
      rescue JSON::ParserError
        puts "⚠️ Invalid JSON received: #{msg}"
      end
    end

    puts "⚠️ Player disconnected."
    clients.delete(client)
  end
end

# What This Does:
# Uses WebSockets (TCPServer) for real-time player communication.
# Assigns players left & right.
# Calls Pong.start_game(clients) when two players connect.
# Listens for movement inputs & sends game state updates.
