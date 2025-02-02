
# Optimizing Docker Setup

For a smoother workflow, configure Docker for both development and production environments.

## Development vs. Production

### Dockerfile

Modify the Dockerfile to handle both environments:

```Dockerfile
# Base image
FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Set working directory
WORKDIR /app

# Copy Gemfile and install dependencies
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy application code
COPY . .

# Expose port
EXPOSE 4567

# Default to development
ENV RACK_ENV development

# Start the server
CMD ["ruby", "app.rb"]
```

---

### docker-compose.yml

1. Define separate configurations for development and production:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
    ports:
      - "4567:4567"
    volumes:
      - .:/app # Mount local files for live updates in development
    env_file:
      - .env
    depends_on:
      - db
    command: ["ruby", "app.rb"]

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ft_user
      POSTGRES_PASSWORD: securepassword
      POSTGRES_DB: ft_transcendance
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

2. For production:

Remove the volume mount (- .:/app) to ensure only the built code is deployed.


---

## Add HTTPS Support

1. Update docker-compose.yml to mount SSL certificates:

```yaml
services:
  backend:
    build: .
    ports:
      - "4567:4567"
    volumes:
      - ./ssl:/ssl
    env_file:
      - .env
    command: ["ruby", "app.rb"]
```

2. Update app.rb to enable HTTPS:

```rb
require 'webrick/https'

set :server_settings, {
  SSLEnable: true,
  SSLVerifyClient: OpenSSL::SSL::VERIFY_NONE,
  SSLPrivateKey: OpenSSL::PKey::RSA.new(File.open('ssl/key.pem')),
  SSLCertificate: OpenSSL::X509::Certificate.new(File.open('ssl/cert.pem'))
}
```

---

## Testing Dockerized Backend

1. Start the containers:

```bash
docker-compose up --build
```

2. Test all endpoints:

Matchmaking: /matchmaking.

Tournament: /tournament.

WebSocket: /ws.
