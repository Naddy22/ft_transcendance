
# Use official Ruby image
FROM ruby:3.2-slim

# Set the working directory
WORKDIR /app

# Copy backend files
COPY . .

# Install required gems (if any)
RUN bundle install || true  # Ignore errors if no Gemfile exists

# Expose the WebSocket port
EXPOSE 4000

# Start the WebSocket server
CMD ["ruby", "server.rb"]
