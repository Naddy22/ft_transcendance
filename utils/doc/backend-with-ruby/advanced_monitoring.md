
# Advanced Monitoring

>Set up monitoring tools (Prometheus/Grafana) to track performance and logs.

---

## Monitoring Tools with Docker

> Overview  
> Prometheus and Grafana provide a robust solution to monitor metrics like CPU usage, memory, response time, and WebSocket connections.


---

### Set Up Monitoring with Prometheus and Grafana

#### Step 1: Update docker-compose.yml

Add Prometheus and Grafana services:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
    ports:
      - "4567:4567"
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
      - prometheus
    command: ["ruby", "app.rb"]

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: ft_user
      POSTGRES_PASSWORD: securepassword
      POSTGRES_DB: ft_transcendance
    volumes:
      - db_data:/var/lib/postgresql/data

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  db_data:
  grafana_data:
```

---

#### Step 2: Configure Prometheus

Create a prometheus.yml file in the project root:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:4567'] # Backend container
```

---

#### Step 3: Start the Monitoring Tools

Run the containers:

```bash
docker-compose up --build
```

---

#### Step 4: Access Prometheus and Grafana

Prometheus: http://localhost:9090

Grafana: http://localhost:3000


---

#### Step 5: Configure Grafana

1. Login to Grafana (default: admin/admin).

2. Add Prometheus as a data source:

URL: `http://prometheus:9090`


3. Create a dashboard:

Visualize metrics like HTTP request counts, response times, or WebSocket connections.


---

#### Step 6: Monitor Backend Metrics

Use Ruby to expose Prometheus-compatible metrics:

1. Add the prometheus-client gem:

gem 'prometheus-client'

Install the gem:

bundle install


2. Update app.rb:

```
require 'prometheus/client'

# Initialize Prometheus metrics
Prometheus::Client.configure do |config|
  config.logger = Logger.new(STDOUT)
end

metrics = Prometheus::Client.registry
http_requests = Prometheus::Client::Counter.new(:http_requests_total, docstring: 'Total HTTP requests')
metrics.register(http_requests)

before do
  http_requests.increment(labels: { path: request.path })
end

get '/metrics' do
  metrics.text
end
```

3. Access the metrics at /metrics:

curl http://localhost:4567/metrics

