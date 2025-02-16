
# ft_transcendence Plan

## **File Structure**
```bash
ft_transcendence/
│── backend/                 # Fastify backend with Node.js
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database schemas (SQLite)
│   │   ├── routes/          # API route definitions
│   │   ├── middlewares/     # Authentication, logging, error handling
│   │   ├── services/        # Helper functions, matchmaking, tournament logic
│   │   ├── game/            # Pong game logic
│   │   ├── config/          # Configurations (DB, environment variables)
│   │   ├── utils/           # Utility functions (e.g., password hashing)
│   │   ├── app.ts           # Fastify setup & initialization
│   │   ├── server.ts        # Main entry point for backend
│   ├── prisma/              # SQLite setup with Prisma ORM
│   │   ├── schema.prisma    # Prisma database schema
│   ├── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│
│── frontend/                # Frontend (React with Tailwind CSS)
│   ├── src/
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Pages (Home, Game, Profile, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Global state management
│   │   ├── services/        # API calls (e.g., Axios fetches)
│   │   ├── utils/           # Helper functions
│   │   ├── App.tsx          # Main React component
│   │   ├── main.tsx         # React entry point
│   ├── public/              # Public assets (index.html, icons)
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── vite.config.ts       # Vite configuration
│
│── game/                    # Pong game (Babylon.js)
│   ├── src/
│   │   ├── game.ts          # Main game logic (Babylon.js)
│   │   ├── renderer.ts      # 3D rendering logic
│   │   ├── physics.ts       # Ball physics & paddle interactions
│   ├── package.json         # Game-specific dependencies
│
│── database/                # SQLite Database
│   ├── migrations/          # Prisma migrations
│   ├── data.db              # SQLite database file
│
│── docs/                    # Documentation & API specs
│   ├── API.md               # Backend API documentation
│   ├── README.md            # General project documentation
│
│── tests/                   # Testing setup
│   ├── backend/             # Backend tests (Jest)
│   ├── frontend/            # Frontend tests (Jest, React Testing Library)
│   ├── e2e/                 # End-to-End tests (Playwright/Cypress)
│
│── deployments/             # Deployment configurations
│   ├── nginx.conf           # Reverse proxy config for production
│   ├── ssl/                 # SSL certificates (if needed)
│
│── docker/                  # Docker-related configurations
│   ├── backend.Dockerfile   # Dockerfile for backend
│   ├── frontend.Dockerfile  # Dockerfile for frontend
│   ├── game.Dockerfile      # Dockerfile for game
│   ├── .dockerignore        # Docker ignore file
│
│── scripts/                 # Helper scripts
│   ├── start.sh             # Script to start all services
│   ├── db_migrate.sh        # Script to run DB migrations
│
│── docker-compose.yml       # Main Docker Compose file
│── docker-compose.dev.yml   # Docker Compose for development
│── docker-compose.prod.yml  # Docker Compose for production
│── Makefile                 # Simplified commands for running services
│── .gitignore               # Git ignored files
│── README.md                # Main project readme
```

### Explanation of the Structure
- `backend/` (Fastify + SQLite)
	- Follows MVC (Model-View-Controller) pattern.
	- `routes/` defines API endpoints, `controllers/` handle logic, and `models/` store DB structures.
	- `middlewares/` include authentication (JWT, OAuth), rate limiting, logging, etc.
	- `services/` implement business logic such as matchmaking, tournament handling.
	- Uses Prisma ORM for SQLite.
- `frontend/` (React + Tailwind CSS + TypeScript)
	- Uses a modular component structure.
	- `context/` handles global state (e.g., user authentication, game state).
	- `services/` fetch API data (e.g., players, matches).
	- `pages/` contain different views like Home, Profile, Tournament.
	- Uses Vite for fast builds.
- `game/` (Babylon.js)
	- Implements the Pong game with WebGL-based rendering.
	- `game.ts` manages game state, `renderer.ts` handles 3D rendering, and `physics.ts` contains ball and paddle physics.
- `database/`
	- Stores SQLite database and Prisma migrations.
- `tests/`
	- Includes unit tests, frontend tests, and E2E tests.
- `deployments/`
	- For `nginx.conf`, SSL setup, and other deployment configurations.
- `docker/`
	- Stores separate Dockerfiles for backend, frontend, and game.
	- Includes .dockerignore to optimize builds.
- `scripts/`
	- Holds helpful shell scripts like:
		- start.sh → Start all services.
		- db_migrate.sh → Run Prisma migrations.
- **Makefile**
	- Automates commands like:
```bash
make run             # Start everything
make stop            # Stop services
make backend         # Run backend locally
make frontend        # Run frontend locally
make game            # Start Pong game
make db_migrate      # Run database migrations
make test            # Run all tests
```
- Separate `docker-compose` files
	- `docker-compose.yml` → General file for all services.
	- `docker-compose.dev.yml` → Uses volumes for hot reloading.
	- `docker-compose.prod.yml` → Optimized for production.


---

## Docker - docker-compose

### Multiple `docker-compose.yml` files

1. `docker-compose.yml` (Main file)
	- Defines the core services (backend, frontend, database).

2. `docker-compose.dev.yml` (Development setup)
	- Includes volumes for hot-reloading.
	- Uses `nodemon` (for backend) and `Vite dev server` (for frontend).
	- Mounts the local source code for development.

3. `docker-compose.prod.yml` (Production setup)
	- Uses `multi-stage builds` to create optimized containers.
	- Ensures security best practices.

To specify which file to use:
```bash
docker-compose -f docker-compose.dev.yml up
```
or
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### `.dockerignore` file

```bash
# Ignore node_modules since we install them inside Docker
node_modules
dist
build
.env
.git
.gitignore
.vscode
logs
.DS_Store
npm-debug.log
yarn-error.log
```
This keeps our Docker images lightweight and prevents accidental inclusion of sensitive files like .env.

---

## Implementation Steps

### Step 1: Backend Setup (Fastify, SQLite, Prisma)

✅ 1.1 Initialize Backend
- Set up Fastify with a structured API.
- Define server.ts to initialize Fastify and configure middlewares.

✅ 1.2 Database Configuration (Prisma & SQLite)
- Define schema.prisma to create tables for:
	- Users (for authentication & matchmaking).
	- Matches (for game results).
	- Tournaments (for organizing the matchmaking).
- Run migrations:
```sh
make db-migrate
```

✅ 1.3 Implement Authentication (JWT)
- Secure user authentication using:
	- Password hashing (e.g., bcrypt).
	- JWT-based authentication.
	- Secure login and registration API.

✅ 1.4 API Routes
- Implement routes inside routes/:
	- /auth/register – Register new users.
	- /auth/login – Authenticate users.
	- /users/:id – Get user profile.
	- /matches – Retrieve match history.
	- /tournament – Organize match queue.


### Backend Initialization

#### 1. Initialize Backend
```sh
cd backend
npm init -y
npm install fastify cors dotenv @prisma/client bcrypt jsonwebtoken
npm install --save-dev typescript ts-node @types/node @types/jsonwebtoken @types/bcrypt
```

#### 2. Setup Fastify Server (`backend/src/server.ts`)
```typescript
import Fastify from 'fastify';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();
const app = Fastify({ logger: true });

app.register(userRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

#### 3. Define Prisma Schema (`backend/prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./database.db"
}

model User {
  id       String  @id @default(uuid())
  email    String  @unique
  password String
  createdAt DateTime @default(now())
}
```

#### 4. Run Prisma Migrations
```sh
cd backend
npx prisma migrate dev --name init
```

#### 5. Setup User Authentication Routes (`backend/src/routes/userRoutes.ts`)
```typescript
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashedPassword } });
    reply.send({ id: user.id, email: user.email });
  });
}
```

#### 6. Start Backend
**Before Running** `make backend`
- **Ensure `.env` is created and correctly configured.**
- **Run `npx prisma migrate dev --name init` again if needed.**
- **Start the backend:**
```sh
make backend
```

#### Suggested current content for `backend/.env`
```bash
# Database Configuration
DATABASE_URL="file:./prisma/database.db"  # Path to the SQLite database file

# Authentication
JWT_SECRET="your_super_secret_key"  # Change this to a strong secret for JWT

# Server Configuration
PORT=3000  # The port Fastify will run on

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"  # Frontend URL during development
```

##### Explanations of Each Variable

1. `DATABASE_URL`
- Specifies the **SQLite database file location**.
- This should match the database URL in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./database.db"
}
```

2. `JWT_SECRET`
- Used for **signing JWT tokens** for user authentication.
- **Make sure to change this** to a **long, random string** in production.

3. `PORT`
- Specifies the port where Fastify will run (`3000` by default).

4. `CORS_ORIGIN`
- Specifies the allowed origin for **CORS requests**.
- This should match the **frontend URL** (`http://localhost:5173` in dev mode).

##### Makefile Target to Create `.env`
```make
# Define multi-line variable for the .env content
define ENV_CONTENT
DATABASE_URL="file:./prisma/database.db"
JWT_SECRET="your_super_secret_key"
PORT=3000
CORS_ORIGIN="http://localhost:5173"

endef
export ENV_CONTENT

create-env:
	@if [ ! -f backend/.env ]; then \
		echo "Creating backend/.env file..."; \
		echo -e $$DEFINE_ENV > backend/.env; \
		echo ".env file created!"; \
	else \
		echo ".env file already exists."; \
	fi
```


#### Next Steps
If everything works fine, the backend should start successfully on `http://localhost:3000`.\
You can test if it's running using:
```bash
curl -i http://localhost:3000
```
or open it in a browser.

---
---

### Step 2: Frontend Setup (React + Vite + Tailwind)

✅ 2.1 Initialize Frontend
- Set up Vite with React and Tailwind CSS.
- Define App.tsx and main.tsx for SPA.

✅ 2.2 Create Authentication Pages
- Implement Login & Registration pages (pages/Auth.tsx).
- Connect with backend API (services/auth.ts).

✅ 2.3 User Dashboard
- Show match history, friends, and user statistics (pages/Dashboard.tsx).

✅ 2.4 Multiplayer Matchmaking UI
- Create match queue UI for joining and managing tournaments.

### Step 3: Implement the Pong Game (Babylon.js)

✅ 3.1 Game Setup
- Initialize Babylon.js inside game/src/game.ts.
- Render a basic 3D Pong game.

✅ 3.2 Multiplayer WebSocket Connection
- Establish real-time communication between two players using WebSockets.

✅ 3.3 Sync Game State
- Ensure both players see the same game state.

### Step 4: Secure the Application

✅ 4.1 Protect Against Security Risks
- Secure against SQL Injection and XSS attacks.
- Ensure HTTPS & secure WebSockets (wss://).
- Validate all user input (backend).

✅ 4.2 Implement OAuth (Optional)
- Allow login via Google / 42 API.

### Step 5: Testing & Deployment

✅ 5.1 Unit Tests
- Test backend API using Jest (tests/backend).
- Test frontend UI using React Testing Library.

✅ 5.2 End-to-End Tests
- Set up Cypress or Playwright to test full user flows.

✅ 5.3 Deploy to Production
- Use docker-compose.prod.yml to deploy the full stack.

### Suggested Order for Implementation

1️⃣ Backend → Database Schema, API Routes, Authentication\
2️⃣ Frontend → React Components, Matchmaking UI, API Integration\
3️⃣ Game → Babylon.js Pong, WebSocket Multiplayer\
4️⃣ Security → Data Validation, OAuth, Secure WebSockets\
5️⃣ Testing & Deployment → Unit Tests, E2E Tests, Production Setup\


---



---


/////

This project is about creating a website for the mighty Pong contest!

Overview
Your software will offer a nice user interface and real-time multiplayer capabilities allowing to play Pong with all your friends!
• The use of libraries or tools that provide an immediate and complete solution for an entire feature or a module is prohibited.
• Any direct instruction regarding the use (can, must, can’t) of a third-party library or tool must be followed.
• The use of a small library or tool that solves a simple, unique task representing a subcomponent of a larger feature or module, is allowed.
• During the evaluation, the team will justify any use of library or tool that is not explicitly approved by the project guidelines and is not in contradiction with the project’s constraints.
• During the evaluation, the evaluator will take responsibility for determining whether the use of a specific library or tool is legitimate (and allowed) or if it essentially solves an entire feature or module (and is therefore prohibited).

Technical requirement
Your project must comply with the following rules:

• Your website must be a single-page application. The user should be able to use the Back and Forward buttons of the browser.
• Your website must be compatible with the latest stable up-to-date version of Mozilla Firefox. Of course, it can be compatible with other web browsers!
• The user should encounter no unhandled errors or warnings when browsing the website.
• You must use Docker to run your website. Everything must be launched with a single command line to run an autonomous container.

• Backend: Fastify with Node.js.

• Frontend: Must use the Tailwind CSS in addition of the Typescript, and nothing else.

• Database: The designated database for all DB instances in your project is SQLite.

Game
The main purpose of this website is to play Pong versus other players.
• Users must be able to participate in a live Pong game against another player directly on the website. Both players will use the same keyboard. 
• A player must be able to play against another, and a tournament system should also be available.
This tournament will consist of multiple players who can take turns playing agains each other.
You have flexibility in how you implement the tournament, but it must clearly display who is playing against whom and the order of the play.
• A registration system is required: at the start of a tournament, each player must input their alias.
The aliases will be reset when a new tournament begins. However, this requirement can be modified using the Standard User Management module.
• There must be a matchmaking system: the tournament system should organize the matchmaking of the participants, and announce the next match.
• All players must adhere to the same rules, including having identical paddle speed.

Security concerns
In order to create a functional website, there are several security concerns you must address:
• Any password stored in your database, if applicable, must be hashed.
• Your website must be protected against SQL injections/XSS attacks.
• It is mandatory to enable an HTTPS connection for all aspects (use wss instead of ws for example).
• You must implement validation mechanisms for forms and any user input on the server side since a backend is employed.
• It’s essential to prioritize the security of your website. Securing the site remains critical.
Please make sure you use a strong password hashing algorithm.
For obvious security reasons, any credentials, API keys, env variables etc., must be saved locally in a .env file and ignored by git.
Publicly stored credentials will cause your project to fail.

Modules

• Standard user management, authentication and users across tournaments.
◦ Users can securely subscribe to the website.
◦ Registered users can securely log in.
◦ Users can select a unique display name to participate in tournaments.
◦ Users can update their information.
◦ Users can upload an avatar, with a default option if none is provided.
◦ Users can add others as friends and view their online status.
◦ User profiles display stats, such as wins and losses.
◦ Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users.
The management of duplicate usernames/emails is at your discretion; please ensure a logical solution in provided.

• Implementing Advanced 3D Techniques
This major module,"Graphics," focuses on enhancing the visual aspects of the Pong game.
It introduces the use of advanced 3D techniques to create a more immersive gaming experience.
Specifically, the Pong game will be developed using Babylon.js to achieve the desired visual effects.
◦ Advanced 3D Graphics: The primary goal of this module is to implement advanced 3D graphics techniques to elevate the visual quality of the Pong game.
By utilizing Babylon.js , the goal is to create stunning visual effects that immerse players in the gaming environment.
◦ Immersive Gameplay: The incorporation of advanced 3D techniques enhances the overall gameplay experience by providing users with a visually engaging and captivating Pong game.
◦ Technology Integration: The chosen technology for this module is Babylon.js .
These tools will be used to create the 3D graphics, ensuring compatibility and optimal performance.
This major module aims to revolutionize the Pong game’s visual elements by introducing advanced 3D techniques.
Through the use of Babylon.js , we aim to provide players with an immersive and visually stunning gaming experience.

• Support on all devices.
In this module, the main focus is to ensure that your website works seamlessly on all types of devices.
Key features and objectives include:
◦ Ensure the website is responsive, adapting to different screen sizes and orientations, providing a consistent user experience on desktops, laptops, tablets, and smartphones.
◦ Ensure that users can easily navigate and interact with the website using different input methods, such as touchscreens, keyboards, and mice, depending on the device they are using.
This module aims to provide a consistent and user-friendly experience on all devices, maximizing accessibility and user satisfaction.

• Expanding Browser Compatibility.
In this minor module, the objective is to enhance the compatibility of the web application by adding support for an additional web browser.
Key features and objectives include:
◦ Extend browser support to include an additional web browser, ensuring that users can access and use the application seamlessly.
◦ Conduct thorough testing and optimization to ensure that the web application functions correctly and displays correctly in the newly supported browser.
◦ Address any compatibility issues or rendering discrepancies that may arise in the added web browser.
◦ Ensure a consistent user experience across all supported browsers, maintaining usability and functionality.
This minor module aims to broaden the accessibility of the web application by supporting an additional web browser,
providing users with more choices for their browsing experience.

• Multiple language support.
In this minor module, the objective is to ensure that your website supports multiple languages to cater to a diverse user base.
Key features and goals include:
◦ Implement support for a minimum of three languages on the website to accommodate a broad audience.
◦ Provide a language switcher or selector that allows users to easily change the website’s language based on their preferences.
◦ Translate essential website content, such as navigation menus, headings, and key information, into the supported languages.
◦ Ensure that users can navigate and interact with the website seamlessly, regardless of the selected language.
◦ Consider using language packs or localization libraries to simplify the translation process and maintain consistency across different languages.
◦ Allow users to set their preferred language as the default for subsequent visits.
This minor module aims to enhance the accessibility and inclusivity of your website by offering content in multiple languages, making it more user-friendly for a diverse international audience.

• Add accessibility for Visually Impaired Users.
In this minor module, the goal is to make your website more accessible for visually impaired users.
Key features include:
◦ Support for screen readers and assistive technologies.
◦ Clear and descriptive alt text for images.
◦ High-contrast color scheme for readability.
◦ Keyboard navigation and focus management.
◦ Options for adjusting text size.
◦ Regular updates to meet accessibility standards.
This module aims to improve the website’s usability for individuals with visual impairments and ensure compliance with accessibility standards.

//

• Live Chat.
In this module, you need to create a chat feature for users:
◦ The user should be able to send direct messages to other users.
◦ The user should be able to block other users, preventing them from seeing any further messages from the blocked account.
◦ The user should be able to invite other users to play a Pong game through the chat interface.
◦ The tournament system should be able to notify users about the next game.
◦ The user should be able to access other players’ profiles through the chat interface.

• Introduce an AI opponent.
In this major module, the objective is to incorporate an AI player into the game.
Notably, the use of the A* algorithm is not permitted for this task.
Key features and goals include:
◦ Develop an AI opponent that provides a challenging and engaging gameplay experience for users.
◦ The AI must replicate human behavior, which means that in your AI implementation, you must simulate keyboard input.
The constraint here is that the AI can only refresh its view of the game once per second, requiring it to anticipate bounces and other actions.
The AI must utilize power-ups if you have chosen to implement the Game customization options module.
◦ Implement AI logic and decision-making processes that enable the AI player to make intelligent and strategic moves.
◦ Explore alternative algorithms and techniques to create an effective AI player without relying on A*.
◦ Ensure that the AI adapts to different gameplay scenarios and user interactions.
You will need to explain in detail how your AI works during your evaluation. Creating an AI that does nothing is strictly prohibited;
it must have the capability to win occasionally.
This major module aims to enhance the game by introducing an AI opponent that adds excitement and competitiveness without relying on the A* algorithm.

