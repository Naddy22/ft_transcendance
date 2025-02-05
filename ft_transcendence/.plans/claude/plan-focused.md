# ft_transcendence Implementation Guide

## 1. Selected Modules & Architecture

### 1.1 Major Modules (7 total)
1. Remote Players (Gameplay)
2. Multiplayer (3-4 players) (Gameplay)
3. Additional Game + Matchmaking (Gameplay)
4. Live Chat (Gameplay)
5. AI Opponent (AI-Algo)
6. Standard User Management (Required for other features)
7. Backend Framework (Required for scalability)

### 1.2 Minor Modules (6 total)
1. Game Customization Options (Gameplay)
2. User/Game Stats Dashboard (AI-Algo)
3. Multi-device Support (Accessibility)
4. Browser Compatibility (Accessibility)
5. Multiple Languages (Accessibility)
6. Accessibility Features (Accessibility)

## 2. Project Setup

```bash
project/
├── frontend/
│   ├── src/
│   │   ├── games/
│   │   │   ├── pong/
│   │   │   └── additional-game/
│   │   ├── components/
│   │   ├── i18n/
│   │   └── styles/
├── backend/
│   ├── src/
│   │   ├── game-logic/
│   │   ├── matchmaking/
│   │   ├── ai/
│   │   └── chat/
└── docker/
```

### 2.1 Core Technologies
```yaml
# Backend
- Fastify (Node.js framework)
- SQLite (Database)
- WebSocket (Real-time communication)

# Frontend
- TypeScript
- Tailwind CSS
- React
- i18next (Internationalization)
```

## 3. Game Implementation

### 3.1 Base Pong Game Engine
```typescript
// frontend/src/games/pong/PongGame.ts
interface GameState {
  players: {
    id: string;
    position: Vector2D;
    score: number;
    paddle: {
      width: number;
      height: number;
      position: Vector2D;
    };
  }[];
  ball: {
    position: Vector2D;
    velocity: Vector2D;
    radius: number;
  };
  powerUps: PowerUp[];
}

class PongGame {
  private state: GameState;
  private wsClient: WebSocket;
  
  constructor(gameMode: 'classic' | 'multiplayer' | 'ai') {
    this.state = this.initializeState(gameMode);
    this.wsClient = new WebSocket('ws://localhost:8000/game');
    this.setupNetworkHandlers();
  }

  private setupNetworkHandlers() {
    this.wsClient.onmessage = (event) => {
      const update = JSON.parse(event.data);
      this.handleStateUpdate(update);
    };
  }

  // Game loop and physics
  private update() {
    this.updateBallPosition();
    this.checkCollisions();
    this.applyPowerUps();
    this.broadcastState();
  }
}
```

### 3.2 Multiplayer Implementation
```typescript
// backend/src/game-logic/MultiplayerGame.ts
class MultiplayerGame {
  private players: Map<string, WebSocket> = new Map();
  private gameState: GameState;
  private readonly MAX_PLAYERS = 4;

  constructor() {
    this.gameState = this.initializeState();
  }

  addPlayer(playerId: string, ws: WebSocket) {
    if (this.players.size >= this.MAX_PLAYERS) {
      throw new Error('Game is full');
    }

    this.players.set(playerId, ws);
    this.assignPlayerPosition(playerId);
    this.broadcastPlayerJoined(playerId);
  }

  private assignPlayerPosition(playerId: string) {
    const positions = {
      0: { x: 0, y: 50 },         // Left
      1: { x: 100, y: 50 },       // Right
      2: { x: 50, y: 0 },         // Top
      3: { x: 50, y: 100 }        // Bottom
    };
    
    const playerIndex = this.players.size - 1;
    const position = positions[playerIndex];
    this.gameState.players[playerId].position = position;
  }
}
```

### 3.3 AI Opponent Implementation
```typescript
// backend/src/ai/PongAI.ts
class PongAI {
  private readonly UPDATE_INTERVAL = 1000; // 1 second as per requirements
  private lastUpdate: number = 0;
  
  predictBallPosition(gameState: GameState): Vector2D {
    // Implement ball trajectory prediction
    const { position, velocity } = gameState.ball;
    return {
      x: position.x + velocity.x * this.UPDATE_INTERVAL,
      y: position.y + velocity.y * this.UPDATE_INTERVAL
    };
  }

  calculateMove(gameState: GameState): PaddleMovement {
    if (Date.now() - this.lastUpdate < this.UPDATE_INTERVAL) {
      return 'none';
    }

    const prediction = this.predictBallPosition(gameState);
    const aiPaddle = gameState.players.find(p => p.isAI)?.paddle;
    
    if (!aiPaddle) return 'none';

    this.lastUpdate = Date.now();
    return aiPaddle.position.y < prediction.y ? 'up' : 'down';
  }
}
```

### 3.4 Game Customization
```typescript
// frontend/src/games/customization/PowerUps.ts
interface PowerUp {
  type: 'speedBoost' | 'paddleSize' | 'multiBall';
  duration: number;
  active: boolean;
}

class PowerUpManager {
  private activePowerUps: PowerUp[] = [];

  spawnPowerUp() {
    const types = ['speedBoost', 'paddleSize', 'multiBall'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      type: randomType,
      duration: 10000, // 10 seconds
      active: false
    };
  }

  applyPowerUp(powerUp: PowerUp, gameState: GameState) {
    switch (powerUp.type) {
      case 'speedBoost':
        gameState.ball.velocity = multiply(gameState.ball.velocity, 1.5);
        break;
      case 'paddleSize':
        // Implement paddle size change
        break;
      case 'multiBall':
        // Implement multiple balls
        break;
    }
  }
}
```

## 4. Accessibility Implementation

### 4.1 Responsive Design
```typescript
// frontend/src/components/ResponsiveGame.tsx
const ResponsiveGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas width={dimensions.width} height={dimensions.height}>
        {/* Game rendering */}
      </Canvas>
    </div>
  );
};
```

### 4.2 Internationalization
```typescript
// frontend/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      game: {
        start: 'Start Game',
        pause: 'Pause',
        resume: 'Resume',
        score: 'Score: {{score}}'
      }
    }
  },
  fr: {
    translation: {
      game: {
        start: 'Commencer',
        pause: 'Pause',
        resume: 'Reprendre',
        score: 'Score: {{score}}'
      }
    }
  },
  es: {
    translation: {
      game: {
        start: 'Empezar',
        pause: 'Pausar',
        resume: 'Continuar',
        score: 'Puntuación: {{score}}'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
```

### 4.3 Accessibility Features
```typescript
// frontend/src/components/AccessibleGame.tsx
const AccessibleGame: React.FC = () => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [textToSpeech, setTextToSpeech] = useState(false);

  const announceGameState = (state: GameState) => {
    if (!textToSpeech) return;
    
    const message = `Score: Player 1 ${state.players[0].score}, 
                     Player 2 ${state.players[1].score}`;
    
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div role="application" aria-label="Pong Game">
      <div className="accessibility-controls">
        <button
          onClick={() => setHighContrastMode(!highContrastMode)}
          aria-pressed={highContrastMode}
        >
          High Contrast Mode
        </button>
        {/* Other accessibility controls */}
      </div>
      
      <GameCanvas
        className={highContrastMode ? 'high-contrast' : ''}
        aria-label="Game Area"
      />
    </div>
  );
};
```

## 5. Stats Dashboard

```typescript
// frontend/src/components/dashboard/GameStats.tsx
interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  highestScore: number;
}

const GameStats: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats>();

  useEffect(() => {
    fetchPlayerStats().then(setStats);
  }, []);

  return (
    <div className="stats-dashboard">
      <div className="stat-card">
        <h3>Win Rate</h3>
        <div className="stat-value">{stats?.winRate}%</div>
      </div>
      {/* Other stat cards */}
    </div>
  );
};
```

## 6. Live Chat Implementation

```typescript
// frontend/src/components/chat/ChatSystem.tsx
interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: number;
}

const ChatSystem: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:8000/chat');
    
    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    wsRef.current.onopen = () => setConnected(true);

    return () => wsRef.current?.close();
  }, []);

  const sendMessage = (content: string) => {
    if (!wsRef.current || !connected) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content
    }));
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      <ChatInput onSend={sendMessage} />
    </div>
  );
};
```
