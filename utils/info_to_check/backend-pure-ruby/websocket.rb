
# WebSockets (Real-Time Updates)

require "websocket"
require "socket"

server = TCPServer.new(4000)

loop do
  client = server.accept
  Thread.new(client) do |conn|
    conn.puts "Connected to WebSocket matchmaking!"
    while (msg = conn.gets)
      conn.puts "Match update: #{msg}"
    end
    conn.close
  end
end

# Handles real-time tournament updates.
