
# Backend Deployment with Docker


## Create a Dockerfile

1. Add a Dockerfile to your project:

```Dockerfile
# Base image
FROM ruby:3.2-slim

# Install dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Set the working directory
WORKDIR /app

# Copy Gemfile and install dependencies
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy the application code
COPY . .

# Expose the port
EXPOSE 4567

# Start the server
CMD ["ruby", "app.rb"]
```

2. Build the Docker image:

```bash
docker build -t ft_transcendance-backend .
```

3. Run the container:

```bash
docker run -p 4567:4567 --env-file .env ft_transcendance-backend
```

---

## Set Up Docker Compose

> For multi-container deployment (e.g., with PostgreSQL), use Docker Compose.

1. Create a docker-compose.yml file:

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "4567:4567"
    env_file:
      - .env
    depends_on:
      - db

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

2. Build and start the services:

```bash
docker-compose up --build
```

3. Access your backend at http://localhost:4567.


---

## Testing and Next Steps

### Test Matchmaking and Tournament in Docker

1. Run the same curl commands from earlier to test the endpoints inside the container.

2. Ensure PostgreSQL data persists using the db_data volume.

### Next Steps

Add WebSocket Notifications to notify players when they’re matched.

Integrate HTTPS to secure communication.

Expand tournament logic to handle multiple rounds.
