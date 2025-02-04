
# Handling HTTP Requests (API)

require "socket"

server = TCPServer.new("localhost", 3000)

loop do
  client = server.accept
  request = client.gets
  puts request

  client.puts "HTTP/1.1 200 OK"
  client.puts "Content-Type: text/plain"
  client.puts
  client.puts "Hello from pure Ruby backend!"
  client.close
end

# Run it:

# ruby server.rb

# Now, open http://localhost:3000 in your browser.
