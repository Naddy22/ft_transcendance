
!!!PureRuby!!!

Ah, I see! Since ft_transcendence explicitly states that the backend must be written in pure Ruby, you need to be very careful about which gems you use.

Let’s break it down:


---

1. What Does “Pure Ruby” Mean?

✅ Allowed: You can use standard Ruby (IO, Socket, JSON, OpenSSL, etc.).

✅ Some Gems Are Allowed: If a task is not the core focus of the project, you can justify using a gem to "simplify certain actions."

❌ Forbidden: You cannot use frameworks like Rails or Sinatra to replace your work.



---

2. What Can You Use for Your Backend?

Since you can’t use Rails or Sinatra, you’ll need to build everything manually using pure Ruby.

Here’s what you need to implement:

✅ Handling HTTP Requests (API)

You cannot use Sinatra, so you need to create an HTTP server manually. You can use:

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

Run it:

ruby server.rb

Now, open http://localhost:3000 in your browser.


---

✅ Handling JSON (Data Exchange)

Since ft_transcendence involves an API, you need to parse JSON manually:

require "json"

data = { message: "Hello, ft_transcendence!" }
json_string = JSON.generate(data)

parsed_data = JSON.parse(json_string)
puts parsed_data["message"]

This is fine because json is a standard library.


---

✅ Handling WebSockets (Real-Time Communication)

If your project requires real-time communication (e.g., chat, Pong multiplayer), you need WebSockets.

Ruby has a standard WebSocket implementation:

require "socket"

server = TCPServer.new(3000)

loop do
  client = server.accept
  Thread.new(client) do |conn|
    conn.puts "Connected to WebSocket server!"
    while (msg = conn.gets)
      conn.puts "You said: #{msg}"
    end
    conn.close
  end
end

💡 If a WebSocket gem (like websocket-driver) is allowed, use it for ease. Otherwise, manually implement the WebSocket handshake.


---

✅ Database (PostgreSQL)

If using a database is required, you need to manually connect to PostgreSQL without using an ORM like ActiveRecord.

You can use pg gem (since it just interacts with the database and doesn’t do the work for you):

require "pg"

conn = PG.connect(dbname: "ft_transcendence", user: "your_user", password: "your_password")
conn.exec("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT);")

conn.exec("INSERT INTO users (username) VALUES ('Sayd');")

res = conn.exec("SELECT * FROM users;")
res.each { |row| puts row }

conn.close

🔹 This is allowed because you’re still writing SQL manually.


---

3. What Should You Avoid?


---

4. Recommended Backend Structure

Inside backend/, create:

backend/
│── server.rb          # Entry point (main server)
│── routes.rb          # Defines endpoints
│── database.rb        # Handles database interactions
│── websocket.rb       # WebSockets handling (if needed)
│── Gemfile            # Only use minimal gems
│── Gemfile.lock       # Lock file for gems


---

5. What Should You Do Now?

1️⃣ Create server.rb and manually handle HTTP requests.
2️⃣ Decide if WebSockets are needed.
3️⃣ Use PostgreSQL, but manually write queries.
4️⃣ Only use gems that don’t “replace your work.”


---

Would You Like a Full Minimal Example Backend?

I can provide a working "pure Ruby" backend that respects the project rules and includes:

A simple HTTP API.

A PostgreSQL connection.

WebSockets (if required).


Let me know! 🚀

...


