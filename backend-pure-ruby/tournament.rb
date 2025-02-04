
# Tournament System (Matchmaking)

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

# This keeps a queue of players and pairs them into matches.
