
ft_transcendance/
│── backend/                  # Backend (if required)
│   ├── src/                   # PHP source files
│   │   ├── server.php         # WebSocket Server (Multiplayer)
│   │   ├── tournament.php     # Tournament & Matchmaking Logic
│   │   ├── database.php       # Database connection (if used)
│   │   ├── auth.php           # Authentication & User Management
│   │   ├── chat.php           # Chat messages handling
│   ├── Dockerfile             # Backend container configuration
│   ├── .env                   # Environment variables (ignored by Git)
│
│── frontend/                 # Frontend (TypeScript & Babylon.js)
│   ├── src/                   # TypeScript and game logic
│   │   ├── main.ts            # Entry point
│   │   ├── game/              # Core Game Mechanics
│   │   │   ├── game.ts        # Main Game Class
│   │   │   ├── ball.ts        # Ball Mechanics
│   │   │   ├── paddle.ts      # Paddle Mechanics
│   │   │   ├── ai.ts          # AI Opponent
│   │   │   ├── multiplayer.ts # WebSocket Multiplayer Logic
│   │   │   ├── matchmaking.ts # Matchmaking & Tournament System
│   │   │   ├── chat.ts        # Live Chat Feature
│   │   │   ├── customization.ts # Power-ups & Rules Variants
│   │   ├── ui/                # UI Elements
│   │   │   ├── menu.ts        # Main Menu Logic
│   │   │   ├── stats.ts       # Scoreboard & Match History
│   │   ├── assets/            # Images, Sounds, Models
│   │   ├── styles.css         # Styling for UI
│   ├── index.html             # Main HTML file
│   ├── tsconfig.json          # TypeScript Config
│   ├── webpack.config.js      # Webpack for Bundling
│
│── docker/                    # Docker Setup
│   ├── Dockerfile.frontend     # Frontend Container Config
│   ├── Dockerfile.backend      # Backend Container Config
│   ├── docker-compose.yml      # Multi-Service Deployment
│
│── tests/                      # Automated Tests
│   ├── frontend/               # Frontend Unit Tests
│   ├── backend/                # Backend Unit Tests
│
│── README.md                   # Documentation
│── Makefile                     # Automates building, testing, running

