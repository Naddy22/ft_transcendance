
# Routes (Manages API Requests)

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

# This module decouples request handling from server.rb.
