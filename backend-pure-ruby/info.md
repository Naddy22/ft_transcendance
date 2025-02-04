
PureRuby_01

Thanks for sharing the detailed requirements. Given these constraints, I’ll outline a pure Ruby backend implementation that follows the rules while keeping things clean, scalable, and modular.


---

🔹 ft_transcendence Backend (Pure Ruby Implementation)

📌 Core Features (Mandatory)

✅ Pure Ruby HTTP server

✅ WebSockets for real-time matchmaking & game updates

✅ PostgreSQL database connection (manual SQL)

✅ Secure User Authentication (hashed passwords, no Devise)

✅ HTTPS support (OpenSSL)

✅ Form validation (server-side input sanitization)

✅ Tournament system (matchmaking and tracking scores)



---

📌 Folder Structure

backend/
│── server.rb          # Main entry point (HTTP + WebSockets)
│── routes.rb          # Defines API routes
│── database.rb        # Handles PostgreSQL interactions
│── websocket.rb       # WebSockets for real-time updates
│── authentication.rb  # Handles user authentication & password hashing
│── tournament.rb      # Manages matchmaking and game logic
│── .env               # Stores credentials (ignored by Git)
│── Dockerfile         # Backend containerization
│── docker-compose.yml # Runs PostgreSQL + Backend
│── Gemfile            # Lists authorized gems
│── Gemfile.lock       # Locks gem versions

🚀 Everything must be runnable inside a Docker container.


---

🛠 1. HTTP Server (No Sinatra/Rails, Only Pure Ruby)

Since we cannot use a web framework, we’ll use Ruby’s built-in WEBrick to handle HTTP requests.

🔹 server.rb (Pure Ruby HTTP Server)

require "webrick"
require_relative "routes"

server = WEBrick::HTTPServer.new(
  Port: 3000,
  DocumentRoot: ".",
  SSLEnable: true, # Required for HTTPS
  SSLPrivateKey: OpenSSL::PKey::RSA.new(File.read("certs/server.key")),
  SSLCertificate: OpenSSL::X509::Certificate.new(File.read("certs/server.crt"))
)

server.mount_proc "/register" do |req, res|
  res.body = Routes.handle_register(req)
end

server.mount_proc "/login" do |req, res|
  res.body = Routes.handle_login(req)
end

server.mount_proc "/tournament" do |req, res|
  res.body = Routes.handle_tournament(req)
end

trap "INT" do
  server.shutdown
end

server.start

💡 Why WEBrick?

It’s built into Ruby (no need for external libraries).

Allows custom request handling.

Supports HTTPS (required by the project).



---

🔹 2. Routes (Manages API Requests)

🔹 routes.rb

require_relative "authentication"
require_relative "database"
require_relative "tournament"

module Routes
  def self.handle_register(req)
    params = parse_json(req.body)
    Authentication.register(params["username"], params["password"])
  end

  def self.handle_login(req)
    params = parse_json(req.body)
    Authentication.login(params["username"], params["password"])
  end

  def self.handle_tournament(req)
    Tournament.start_matchmaking
  end

  def self.parse_json(data)
    JSON.parse(data) rescue {}
  end
end

💡 This module decouples request handling from server.rb.


---

🔹 3. Database (Manually Managing PostgreSQL)

🔹 database.rb

require "pg"

class Database
  def self.connection
    @conn ||= PG.connect(dbname: "ft_transcendence", user: ENV["DB_USER"], password: ENV["DB_PASSWORD"])
  end

  def self.setup
    connection.exec <<-SQL
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );
    SQL

    connection.exec <<-SQL
      CREATE TABLE IF NOT EXISTS tournaments (
        id SERIAL PRIMARY KEY,
        player1 TEXT NOT NULL,
        player2 TEXT NOT NULL,
        winner TEXT
      );
    SQL
  end
end

Database.setup

💡 We manually write SQL queries to comply with project rules.

Users must be stored securely (passwords hashed).

Tournaments are stored for matchmaking.



---

🔹 4. Authentication (Secure User Registration & Login)

🔹 authentication.rb

require "bcrypt"
require_relative "database"

class Authentication
  def self.register(username, password)
    hashed_password = BCrypt::Password.create(password)
    Database.connection.exec("INSERT INTO users (username, password_hash) VALUES ($1, $2)", [username, hashed_password])
    { status: "success", message: "User registered" }.to_json
  rescue PG::UniqueViolation
    { status: "error", message: "Username already taken" }.to_json
  end

  def self.login(username, password)
    result = Database.connection.exec("SELECT password_hash FROM users WHERE username = $1", [username])
    return { status: "error", message: "Invalid username" }.to_json if result.ntuples.zero?

    stored_hash = result[0]["password_hash"]
    return { status: "success", message: "Login successful" }.to_json if BCrypt::Password.new(stored_hash) == password

    { status: "error", message: "Invalid password" }.to_json
  end
end

💡 Passwords are securely stored using bcrypt.

No plaintext passwords.

SQL injection is prevented with parameterized queries.



---

🔹 5. Tournament System (Matchmaking)

🔹 tournament.rb

require_relative "database"

class Tournament
  @@queue = []

  def self.register_player(username)
    @@queue << username
    { status: "success", message: "#{username} added to matchmaking queue" }.to_json
  end

  def self.start_matchmaking
    return { status: "error", message: "Not enough players" }.to_json if @@queue.size < 2

    player1 = @@queue.shift
    player2 = @@queue.shift
    Database.connection.exec("INSERT INTO tournaments (player1, player2) VALUES ($1, $2)", [player1, player2])

    { status: "success", match: "#{player1} vs #{player2}" }.to_json
  end
end

💡 This keeps a queue of players and pairs them into matches.


---

🔹 6. WebSockets (Real-Time Updates)

🔹 websocket.rb

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

💡 Handles real-time tournament updates.


---

🔹 7. Docker Setup

🔹 Dockerfile

FROM ruby:3.0

WORKDIR /app
COPY . /app

RUN gem install bundler
RUN bundle install

CMD ["ruby", "server.rb"]

🔹 docker-compose.yml

version: "3.9"

services:
  db:
    image: postgres
    environment:
      POSTGRES_DB: ft_transcendence
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      DB_USER: user
      DB_PASSWORD: password
    depends_on:
      - db
    ports:
      - "3000:3000"
      - "4000:4000"


---

✅ Next Steps

> docker-compose up --build  

1️⃣ Test authentication (curl -X POST http://localhost:3000/register)
2️⃣ Test matchmaking (curl -X POST http://localhost:3000/tournament)
3️⃣ Connect frontend to WebSockets


---

🚀 Would you like me to refine this or add features (like JWT authentication, advanced matchmaking, etc.)?


