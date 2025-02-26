
# Backend tools and information

## Key Differences Between `.ts` and `.js`

TypeScript (`.ts`)
- Static Typing: Allows defining types (`string`, `number`, `boolean`, etc.), reducing runtime errors.
- Better IDE Support: Provides autocomplete, inline documentation, and type checking.
- Interface & Type Definitions: Enables defining structured objects (`interface`, `type`).
- Compiles to JavaScript: Needs a build step (`tsc`, Babel, or `esbuild`) before running.
- Better Refactoring: Safer when renaming or changing function signatures.
- Supports Modern JS Features: Works with ES6+ but compiles to older versions if needed.
- Explicit Module Imports: Ensures proper handling of dependencies (`import { ... } from '...'`).
- Strict Mode (`strict: true`): Helps catch errors early.

JavaScript (`.js`)
- Dynamically Typed: No type enforcement; errors might occur at runtime.
- Runs Immediately: No compilation required, making development faster in simple projects.
- Less Strict: Allows flexible coding but increases chances of unexpected bugs.
- Easier for Quick Scripts: Great for prototyping or small-scale projects.
- No Interfaces or Type Annotations: Relies on JSDoc comments or external type checkers (e.g., `Flow`).


## Key Differences Between CommonJS (`require`) and ES Modules (`import`)

CommonJS (CJS)
- Uses `require()` and `module.exports`.
- Synchronous loading (executes modules immediately).
- Default in Node.js (before ES modules support).
- Works without `"type": "module"` in `package.json`.
- Can use `__dirname` and `__filename` directly.
- Supports circular dependencies better.
- Typically used in older Node.js projects.

Example (`server.ts` using CJS):
```ts
const express = require("express");
const app = express();
module.exports = app;
```

ES Modules (ESM)

- Uses `import` and `export` instead of `require()`.
- Asynchronous loading (uses `import()` for dynamic imports).
- Requires `"type": "module"` in `package.json` (or `.mjs` file extension).
- Doesn't support `__dirname` and `__filename` (use `import.meta.url` instead).
- Works better with tree-shaking for optimized builds.
- Recommended for modern JavaScript and TypeScript projects.

Example (`server.ts` using ESM):
```ts
import express from "express";
const app = express();
export default app;
```

### Which One to Use?
- Use ESM (`import/export`) if you're working on a modern project, using TypeScript, or need better compatibility with frontend frameworks.
- Use CommonJS (`require/module.exports`) if you're working with older Node.js versions or using dependencies that don’t support ESM.

For TypeScript, it's best to use ESM unless you're working with legacy code.

---

## Framework vs. a Utility? (Using Fastify and Node.js)

A framework is a structured set of tools, libraries, and conventions 
that help developers build applications faster by handling common tasks like routing, 
request handling, and middleware management.

A utility is a small tool or library that performs a specific task 
but does not impose structure on how the overall application should be built.


### Fastify (Framework)

Fastify is a web framework for Node.js.
It simplifies backend development by handling:
	- Routing (handling different API requests)
	- Middleware (functions that process requests before they reach your business logic)
	- Validation (ensuring data is correctly formatted)
	- Error handling (managing errors properly)
Ex:
```
import Fastify from "fastify";

const server = Fastify();

server.get("/", async (request, reply) => {
  return { message: "Hello, World!" };
});

server.listen({ port: 3000 }, () => {
  console.log("Server running on http://localhost:3000");
});
```
Without a framework, you would have to handle 
HTTP parsing, routing, and error handling manually using raw Node.js APIs, 
which is much harder.

### Utility Example

A utility is just a small library that performs a specific function.
For example, bcrypt is a utility for password hashing:
```
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash("mysecurepassword", 10);
```
Unlike a framework, bcrypt does not impose any project structure; 
it simply helps with password hashing.

---

## Prisma ORM

Prisma is an ORM (Object-Relational Mapper) for databases.
It allows you to interact with SQLite (or other databases) using an easy-to-read API 
instead of writing raw SQL queries.

### Why use Prisma?

	- Easier database interactions: Instead of writing SQL queries manually,
	you can use simple JavaScript/TypeScript commands.

	- Data validation: Prisma ensures that the data you insert follows the schema rules.

	- Automatic migrations: Prisma makes it easier to modify the database schema and update it.

Example of creating a user in SQLite with Prisma:
```
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: "hashedpassword",
      username: "player1",
    },
  });

  console.log(user);
}

main();
```
---

## WebSockets

WebSockets are needed for real-time multiplayer Pong.

	- HTTP APIs (Fastify and REST APIs) are request-response based (one request = one response).
	- WebSockets allow continuous communication between the server and multiple players in real-time.

For example, WebSockets will allow:

	- Live game updates (player movement, ball position)
	- Matchmaking system (players find matches instantly)
	- Live chat (if implemented)

We will use Fastify-WebSocket to integrate WebSockets into Fastify.



---
---

## Simplified backend setup
> With authentication and websockets

minimal but scalable Fastify backend that includes:

- User authentication (JWT-based login & registration)
- WebSockets support (real-time communication for Pong)
- SQLite database with Prisma (handling users & matches)
- Environment variables (security best practices)
- Docker support (for easy deployment)


### Project Structure

```bash
/backend
│── /prisma             # SQLite database schema and migrations
│── /src
│   ├── /controllers    # Business logic for routes
│   ├── /routes         # Fastify routes
│   ├── /models         # Database models (Prisma ORM)
│   ├── /middlewares    # Authentication middleware
│   ├── /services       # Business logic (e.g., matchmaking)
│   ├── /websockets     # WebSocket event handlers
│   ├── app.ts          # Fastify server setup
│   ├── server.ts       # Server entry point
│── .env                # Environment variables
│── package.json        # Node.js dependencies
│── Dockerfile          # Backend container setup
│── docker-compose.yml  # Docker configuration
```

### Setting Up Fastify and Dependencies

Run the following command to create the project and install required dependencies:

> npm install @fastify/jwt@9.0.3


```bash
# 1. Create project directory and initialize it
mkdir backend && cd backend
npm init -y

# 2. Install necessary dependencies (with updated @fastify/jwt)
npm install fastify @fastify/jwt@9.0.3 fastify-cookie fastify-websocket fastify-cors dotenv bcrypt

# 3. Install Prisma ORM and SQLite for database management
npm install @prisma/client sqlite3

# 4. Install Prisma CLI as a dev dependency
npm install --save-dev prisma
```

Verify installation: `npm list --depth=0`

You should see output listing Fastify, Prisma, SQLite, bcrypt, dotenv, and Zod.

### Database Setup (SQLite + Prisma)

**Initialize Prisma**

```bash
npx prisma init
```
This creates the prisma directory and .env file.

**Configure .env**

Edit .env to define the SQLite database location and JWT secret:

```ini
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="supersecretkey"
```

**Define Prisma Schema (`prisma/schema.prisma`)**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  username  String   @unique
  createdAt DateTime @default(now())

  matchesAsPlayer1 Match[] @relation("Player1")
  matchesAsPlayer2 Match[] @relation("Player2")
  matchesAsWinner  Match[] @relation("Winner")
}

model Match {
  id       String @id @default(uuid())

  player1   User   @relation("Player1", fields: [player1Id], references: [id])
  player1Id String

  player2   User   @relation("Player2", fields: [player2Id], references: [id])
  player2Id String

  winner    User?  @relation("Winner", fields: [winnerId], references: [id])
  winnerId  String?

  createdAt DateTime @default(now())
}
```
- Relation Naming: By adding @relation("RelationName"), Prisma differentiates between multiple relationships to the User model.
- Avoids Ambiguity: Each Match now has three separate relationships to User, clearly defining player roles.

**Apply the Database Migration**

```bash
npx prisma migrate dev --name init
```

### Setting Up Fastify Server

**server.ts**

```ts
import Fastify from "fastify";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import matchRoutes from "./routes/matchRoutes";
import WebSocketManager from "./websockets/websocketManager";

dotenv.config();

const server = Fastify({ logger: true });

// Register WebSocket Support
server.register(import("fastify-websocket"));

// Register Routes
server.register(userRoutes, { prefix: "/api/users" });
server.register(matchRoutes, { prefix: "/api/matches" });

// Initialize WebSocket Manager
WebSocketManager(server);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
```

### Authentication System

**User Routes (`routes/userRoutes.ts`)**

```ts
import { FastifyInstance } from "fastify";
import { registerUser, loginUser } from "../controllers/userController";

export default async function (server: FastifyInstance) {
  server.post("/register", registerUser);
  server.post("/login", loginUser);
}
```

**User Controller (`controllers/userController.ts`)**

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "supersecretkey";

export const registerUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password, username } = req.body as { email: string; password: string; username: string };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, username },
  });

  return reply.send({ message: "User registered", user });
};

export const loginUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return reply.status(401).send({ message: "Invalid email/password" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return reply.status(401).send({ message: "Invalid email/password" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1h" });

  return reply.send({ token, user });
};
```

### WebSocket Support

**WebSocket Manager (`websockets/websocketManager.ts`)**

```ts
import { FastifyInstance } from "fastify";

const WebSocketManager = (server: FastifyInstance) => {
  server.get("/ws", { websocket: true }, (connection, req) => {
    console.log("Client connected");

    connection.socket.on("message", (message) => {
      console.log("Received:", message.toString());
      connection.socket.send("Hello from server!");
    });

    connection.socket.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

export default WebSocketManager;
```

### Running in Docker

**Dockerfile**

```dockerfile
FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

**docker-compose.yml**

```yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./database.sqlite
      - JWT_SECRET=mysecret
    volumes:
      - .:/app
      - /app/node_modules
```
