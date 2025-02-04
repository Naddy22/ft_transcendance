
# Database (Manually Managing PostgreSQL)

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

# We manually write SQL queries to comply with project rules.
# Users must be stored securely (passwords hashed).
# Tournaments are stored for matchmaking.
