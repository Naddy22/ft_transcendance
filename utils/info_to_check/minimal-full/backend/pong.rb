
require "json"

module Pong
  WIDTH = 800
  HEIGHT = 400

  @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
  @paddles = { left: HEIGHT / 2, right: HEIGHT / 2 }

  def self.start_game(clients)
    Thread.new do
      loop do
        move_ball
        state = { type: "update", ball: @ball, paddles: @paddles }

        clients.each do |client|
          begin
            client.puts(state.to_json)
          rescue Errno::EPIPE, IOError
            puts "Client disconnected."
            clients.delete(client)
          end
        end
        sleep 0.016 # ~60 FPS
      end
    end
  end

  def self.handle_input(data, clients)
    if data["player"] == "left"
      @paddles[:left] = data["y"]
    elsif data["player"] == "right"
      @paddles[:right] = data["y"]
    end
  end

  def self.move_ball
    @ball[:x] += @ball[:vx]
    @ball[:y] += @ball[:vy]

    # Bounce off top/bottom
    if @ball[:y] <= 0 || @ball[:y] >= HEIGHT
      @ball[:vy] *= -1
    end

    # Reset if out of bounds
    if @ball[:x] < 0 || @ball[:x] > WIDTH
      @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
    end
  end
end


# require "json"

# module Pong
#   WIDTH = 800
#   HEIGHT = 400

#   @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
#   @paddles = { left: HEIGHT / 2, right: HEIGHT / 2 }

#   def self.start_game(clients)
#     Thread.new do
#       loop do
#         move_ball
#         state = { type: "update", ball: @ball, paddles: @paddles }
#         clients.each { |c| c.puts(state.to_json) }
#         sleep 0.016 # ~60 FPS
#       end
#     end
#   end

#   def self.handle_input(data, clients)
#     if data["player"] == "left"
#       @paddles[:left] = data["y"]
#     elsif data["player"] == "right"
#       @paddles[:right] = data["y"]
#     end
#   end

#   def self.move_ball
#     @ball[:x] += @ball[:vx]
#     @ball[:y] += @ball[:vy]

#     # Bounce off top/bottom
#     if @ball[:y] <= 0 || @ball[:y] >= HEIGHT
#       @ball[:vy] *= -1
#     end

#     # Reset if out of bounds
#     if @ball[:x] < 0 || @ball[:x] > WIDTH
#       @ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: 4, vy: 4 }
#     end
#   end
# end

# What This Does:
# Manages game logic (ball movement, collision). 
# Broadcasts game state every 16ms (60 FPS).
# Handles paddle movement from players.
