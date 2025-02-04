
# Ruby - basics and implementation 

> learning Ruby and setting up the backend for the ft_transcendance project. 
> It includes detailed examples and resources for each step.

---
---

## Resources for Further Learning

1. Ruby Basics:

Learn Ruby the Hard Way: [Ruby Official Documentation]()

[FreeCodeCamp's Ruby tutorial]() or [Codecademy’s Ruby course]()

2. Sinatra:

[Sinatra Guide]()


3. PostgreSQL:

[PostgreSQL Documentation]()


4. WebSockets:

[Faye WebSocket Documentation]()

---

## Mini Projects to Learn Ruby

### Build a simple Ruby script (e.g., a calculator).

---
---

## 1. Learning Ruby Basics

### Ruby Specific Features

Understand syntax and basic concepts:  
	- Variables, data types, control flow (if, else, case).  
	- Loops (while, each, for).  
	- Methods and blocks.  

Object-Oriented Programming
	- Classes, modules, inheritance, and mixins.  
	- Understand how Ruby's object model works.  

Key libraries (Standard Library):
	- net/http for basic HTTP requests.  
	- json for parsing and generating JSON.  

### Variables and Data Types:

#### String, Integer, Boolean
name = "John"  
age = 25  
is_logged_in = true  

#### Printing variables
puts "Name: #{name}, Age: #{age}, Logged in: #{is_logged_in}"

### Control Structures:

#### if/else
if age > 18
  puts "Adult"
else
  puts "Minor"
end

#### Case statement
case age
when 0..12
  puts "Child"
when 13..19
  puts "Teenager"
else
  puts "Adult"
end


### Arrays and Hashes:

#### Array
colors = ["red", "green", "blue"]
puts colors[0]  # Access first element

#### Iterate over array
colors.each { |color| puts "Color: #{color}" }

#### Hash (key-value pairs)
user = { name: "John", age: 25 }
puts user[:name]  # Access value by key


### Methods:

def greet(name)
  "Hello, #{name}!"
end

puts greet("Alice")  # Outputs: Hello, Alice!


### Classes and Objects:

class User
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def greet
    "Hello, #{@name}!"
  end
end

user = User.new("John", 25)
puts user.greet  # Outputs: Hello, John!


---

## 2. Setting Up Your Ruby Environment

### Install Ruby

On Debian-based systems (Linux):

```bash
sudo apt update
sudo apt install ruby-full
```

Verify installation:

```bash
ruby --version
```

### Install Bundler

Bundler manages your project’s dependencies:

```bash
gem install bundler
```

---

## 3. Create Your Project

### Initialize a Ruby Project

1. Create a directory for your project:

```bash
mkdir ft_transcendance-backend
cd ft_transcendance-backend
bundle init
```

2. Add dependencies (essential gems) to the Gemfile:

```ruby
gem 'sinatra'  # Lightweight Ruby web framework
gem 'json'     # JSON parsing
gem 'bcrypt'   # For password hashing
gem 'dotenv'   # Manage environment variables

gem 'pg'             # PostgreSQL adapter
gem 'faye-websocket' # WebSocket support
```

3. Install the dependencies:

```bash
bundle install
```

---

## 4. Build a Basic Web Server with Sinatra

### Create app.rb

> Use Sinatra for a lightweight backend  

1. Add a simple Sinatra app:

```
require 'sinatra'
require 'jason'

get '/' do
  { message: 'Welcome to ft_transcendance' }.to_json
end
```

2. Run the app (server):

```bash
ruby app.rb
```

3. Open http://localhost:4567 in your browser to see the output.

---

## 5. Connect to a PostgreSQL Database (Database Integration)

> Use PostgreSQL for user storage (if the Database module is chosen)  

### Install PostgreSQL

1. Install PostgreSQL:

```bash
sudo apt install postgresql postgresql-contrib
```

--- (Not sure about this section)

> Add the pg gem to Gemfile for database interaction.  
> Learn basic SQL queries (INSERT, SELECT, UPDATE, DELETE).  

Example database configuration:

```
require 'pg'
conn = PG.connect(dbname: 'ft_transcendance', user: 'your_user', password: 'your_password')
conn.exec("CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50), password VARCHAR(255));")
```
--- (end of unsure section)

2. Create a database and user:

```bash
sudo -u postgres psql
CREATE DATABASE ft_transcendance;
CREATE USER ft_user WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE ft_transcendance TO ft_user;
\q
```


### Add a Database Connection

1. Create a .env file for storing environment variables:

```bash
touch .env
```

Add the following:

```plaintext
DB_NAME=ft_transcendance
DB_USER=ft_user
DB_PASSWORD=securepassword
```

2. Update app.rb:

```
require 'pg'
require 'dotenv/load'

conn = PG.connect(
  dbname: ENV['DB_NAME'],
  user: ENV['DB_USER'],
  password: ENV['DB_PASSWORD']
)

get '/users' do
  result = conn.exec("SELECT * FROM users;")
  result.map { |row| row }.to_json
end
```

3. Create a users table:

```bash
sudo -u postgres psql ft_transcendance
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(255)
);
```

---

## 6. Add User Registration and Authentication

### Register Endpoint

```
require 'bcrypt'

post '/register' do
  data = JSON.parse(request.body.read)
  hashed_password = BCrypt::Password.create(data['password'])

  conn.exec_params(
    "INSERT INTO users (username, password) VALUES ($1, $2)",
    [data['username'], hashed_password]
  )

  { status: 'User registered' }.to_json
end
```

### Login Endpoint

```
post '/login' do
  data = JSON.parse(request.body.read)
  result = conn.exec_params(
    "SELECT * FROM users WHERE username = $1",
    [data['username']]
  )

  if result.any? && BCrypt::Password.new(result[0]['password']) == data['password']
    { status: 'Login successful' }.to_json
  else
    halt 401, { error: 'Invalid credentials' }.to_json
  end
end
```

---

## 7. Add WebSocket Support

### Install WebSocket

Add this to the Gemfile:

```
gem 'faye-websocket'
```

Install:

```bash
bundle install
```

WebSocket Endpoint

```
require 'faye/websocket'

clients = []

get '/ws' do
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)
    clients << ws

    ws.on :message do |event|
      clients.each { |client| client.send(event.data) }
    end

    ws.on :close do |_event|
      clients.delete(ws)
    end

    ws.rack_response
  else
    halt 400, 'WebSocket endpoint'
  end
end
```

---

## 8. Test Your Setup

### Test WebSocket

Use websocat:

```bash
websocat ws://localhost:4567/ws
```

### Test Registration and Login

1. Use curl to test the /register endpoint:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"1234"}' http://localhost:4567/register
```

2. Test the /login endpoint:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"1234"}' http://localhost:4567/login
```

---
---
---

# To Check

## 5.a User Registration and Authentication **?

### Create endpoints for user management:

POST /register: Register a user (store hashed passwords with bcrypt).  
POST /login: Validate credentials and return a session token.  
Use a simple data structure (like a hash or a text file) for now.

Example user registration:

```
post '/register' do
  data = JSON.parse(request.body.read)
  hashed_password = BCrypt::Password.create(data['password'])
  # Store `data['username']` and `hashed_password` securely.
  { status: 'User registered' }.to_json
end
```

---
---

## Implement Matchmaking and Tournament Logic

### 1. Matchmaking System

Create an endpoint to queue players for matchmaking:

POST /matchmaking: Add a user to the queue.

Match players in pairs when at least two players are available.


### 2. Tournament Bracket

Create a system to manage tournament brackets:

Store player aliases and match order.

Announce next matches via an API endpoint (e.g., GET /tournament).


### 3. Real-Time Updates

Learn and implement WebSockets for real-time updates:

Use the faye-websocket gem for server-side WebSocket support.

Push notifications to connected clients about matchmaking and tournaments.

---
---

## Security and Optimization

### 1. Secure User Data

Hash all passwords using bcrypt before storing them in the database.

Implement form validation for all inputs to prevent SQL injection and XSS.


### 2. Add HTTPS Support

Use the webrick server with an SSL certificate (self-signed for development).


### 3. Environment Variables

Store sensitive information like database credentials in a .env file:

```plaintext
require 'dotenv/load'

db_user = ENV['DB_USER']
db_password = ENV['DB_PASSWORD']
```

### 4. Optimize Code

Refactor your backend for modularity:

Separate concerns into files (e.g., user.rb, matchmaking.rb).

---
---

## Bonus Features and Modules

### 1. Remote Players Module

Extend matchmaking to handle remote players.

Use WebSockets for game synchronization between two players.


### 2. AI Opponent

Add an endpoint to generate AI moves based on game state:

POST /ai-move: Accept the current game state and return the AI’s move.

### 3. User and Game Stats Dashboards

Add endpoints for stats:

GET /stats/user/:id: Fetch user stats (e.g., wins, losses).

GET /stats/game/:id: Fetch game stats (e.g., scores, durations).

---
---

## Ruby Strengths, Weaknesses, and Use Cases

### 1. Strengths:

Simple and elegant syntax, beginner-friendly.

Excellent for rapid prototyping and web applications.

Strong community support and many gems for common tasks.


### 2. Weaknesses:

Slower performance compared to languages like C++ or Go.

Limited for high-performance, CPU-intensive tasks.


### 3. Use Cases:

Web development (popular frameworks: Rails, Sinatra).

Scripting and automation.

Prototyping APIs and applications.

---
---
