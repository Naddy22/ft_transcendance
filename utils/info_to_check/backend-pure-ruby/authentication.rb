
# Authentication (Secure User Registration & Login)

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

# Passwords are securely stored using bcrypt.
# No plaintext passwords.
# SQL injection is prevented with parameterized queries.
