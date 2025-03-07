
# Backend Security Methods

## 🛡 Prevent SQL injection

SQL injection occurs when user input is directly inserted into an SQL query.\
NEVER use string interpolation ("${value}") for database queries.

### Solution: Use Prepared Statements

SQLite (via Fastify SQLite plugin) supports prepared statements, which prevent SQL injection.\
Modify your queries to always use ? placeholders:
```ts
// Prevent SQL Injection: Use prepared statements
const stmt = await fastify.db.prepare(
  "SELECT * FROM users WHERE email = ? OR username = ?"
);
const user = await stmt.get(identifier, identifier); // Secure query
```
Why?\
Using ? placeholders ensures the database treats user input as data, not SQL commands.

Example in `userRoutes.ts` (Update User Route):
```ts
import sanitizeHtml from 'sanitize-html';

export async function userRoutes(fastify: FastifyInstance) {
	// [...]
	fastify.put<{ Params: { id: string }, Body: UpdateUserRequest }>('/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      const { username, email, avatar, status } = req.body;

      if (!id) {
        return reply.status(400).send({ error: "Missing user ID" });
      }

      const updates: string[] = [];
      const values: any[] = [];

      // 🛡️ Sanitize and validate input before updating
      if (username) {
        const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
        if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]+$/)) {
          return reply.status(400).send({ error: "Invalid username format." });
        }
        updates.push("username = ?");
        values.push(sanitizedUsername);
      }
      if (email) {
        const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
        updates.push("email = ?");
        values.push(sanitizedEmail);
      }
      if (avatar) {
        updates.push("avatar = ?");
        values.push(avatar);
      }
      if (status) {
        updates.push("status = ?");
        values.push(status);
      }

      if (updates.length === 0) {
        return reply.status(400).send({ error: "No valid fields to update" });
      }

      values.push(id);
      const stmt = await fastify.db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`);
      await stmt.run(...values);

      reply.send({ message: "User updated" });
    } catch (error) {
      console.error("❌ Error updating user:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });
  // [...]
}
```
Why?\
Sanitizes user input before updating the database.\
Prevents injecting SQL through the update fields.

---

## 🛡 Prevent XSS (Cross-Site Scripting)

XSS occurs when malicious scripts are injected into the frontend via user input.

### Solution: Sanitize User Input

We can use sanitize-html to prevent harmful HTML or scripts from being saved to the database.
```ts
// in authRoutes.ts (Register Route)

import sanitizeHtml from 'sanitize-html';

fastify.post<{ Body: RegisterRequest }>("/register", async (req, reply) => {
  try {
    const { username, email, password } = req.body;

    // 🔍 Validate required fields
    if (!username || !email || !password) {
      return reply.status(400).send({ error: "Username, email, and password are required" });
    }

    // 🛡 Sanitize user input to prevent XSS
    const sanitizedUsername = sanitizeHtml(username, { allowedTags: [], allowedAttributes: {} });
    const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });

    // 🔍 Ensure sanitized inputs are still valid before proceeding
    if (!sanitizedUsername.match(/^[a-zA-Z0-9_-]+$/)) {
      return reply.status(400).send({ error: "Invalid username format" });
    }

	// 🔍 Check if username or email already exists (using sanitized inputs)
	const stmtCheck = await fastify.db.prepare("SELECT id FROM users WHERE email = ? OR username = ?");
	const existingUser = await stmtCheck.all(sanitizedEmail, sanitizedUsername);

	if (existingUser.length > 0) {
	  return reply.status(400).send({ error: "Username or email is already taken." });
	}

    // ✅ Secure database query
    const stmt = await fastify.db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    await stmt.run(sanitizedUsername, sanitizedEmail, password);

    reply.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});
```
Why?\
We sanitize before checking for duplicates to avoid storing malicious values.\
`sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })` removes `<script>`, 
`<img onerror="alert('XSS')">`, and other dangerous elements.

The regex validation (`match(/^[a-zA-Z0-9_-]+$/)`) 
check ensures usernames only contain valid characters.

---

## 🛡 Prevent Brute-Force Attacks

Brute-force attacks happen when an attacker guesses passwords repeatedly.

### Solution: Implement Rate-Limiting

Use @fastify/rate-limit to restrict login attempts.\
Install Fastify Rate-Limit
```sh
npm install @fastify/rate-limit
```

Apply Rate-Limit to Login Route
```ts
// in backend/src/server.ts:

import fastifyRateLimit from "@fastify/rate-limit";

await fastify.register(fastifyRateLimit, {
  max: 5, // Allow only 5 login attempts per minute per IP
  timeWindow: "1 minute",
  errorResponseBuilder: () => {
    return { error: "Too many requests. Please try again later." };
  }
});
```
Why?\
This prevents bots from spamming login attempts to guess passwords.\
After 5 failed attempts, users must wait 1 minute before trying again.

### Alternative: In-Memory Rate Limiting

#### Approach

1. Track failed login attempts in a simple object (failedAttempts).

2. First 2 attempts have no delay.

3. Next attempts have exponential delays (5s → 10s → 20s → 40s → max 5 min).

4. On successful login, reset the counter.

Modified `authRoutes.ts` with In-Memory Rate Limiting
```ts
import { FastifyInstance } from 'fastify';
import { LoginRequest } from "../schemas/userSchema.js";
import bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';

const failedAttempts: Record<string, { count: number; nextTry: number }> = {}; // Track failed logins

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequest }>("/login", async (req, reply) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return reply.status(400).send({ error: "Email or password required." });
      }

      // 🔍 Allow login with either email or username
      const stmt = await fastify.db.prepare("SELECT * FROM users WHERE email = ? OR username = ?");
      const user = await stmt.get(email, email);

      if (!user) return reply.status(401).send({ error: "Invalid email/username" });

      // 🔒 Handle rate limiting using in-memory tracking
      const userKey = `login:${user.id}`;
      const now = Date.now();
      let attempts = failedAttempts[userKey] || { count: 0, nextTry: now };

      if (attempts.nextTry > now) {
        const waitTime = Math.ceil((attempts.nextTry - now) / 1000);
        return reply.status(429).send({ error: `Too many attempts. Try again in ${waitTime}s.` });
      }

      // 🔐 Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        attempts.count += 1;

        // Gradual increase: 1st & 2nd attempt = no delay, then double delay
        if (attempts.count > 2) {
          const delay = Math.min(5 * 2 ** (attempts.count - 3), 300); // Max wait time 5 min
          attempts.nextTry = now + delay * 1000;
        }

        failedAttempts[userKey] = attempts;
        return reply.status(401).send({ error: "Invalid password" });
      }

      // ✅ Successful login → Reset failed attempts
      delete failedAttempts[userKey];

      // Set user status to "online"
      const updateStmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      await updateStmt.run("online", user.id);

      reply.send({ message: "✅ Login successful", user: { id: user.id, username: user.username, email: user.email, status: "online" } });
    } catch (error) {
      console.error("❌ Login error:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}
```
How This works:
- Tracks failed attempts in-memory using an object (failedAttempts).
- Prevents brute-force attacks with progressive waiting times.
- Resets the counter on successful login.
- Avoids SQLite writes for every failed attempt (which could slow things down)

> [!NOTE]
> The in-memory approach works fine if the server doesn’t restart often.\
> If the server restarts, the data resets, meaning attackers could bypass delays by restarting.\
> For persistence, we could store failed attempts in the SQLite database.

### SQLite-Based Rate Limiting for Login Attempts

For persistent tracking of failed login attempts across server restarts, 
we will store failed attempts in SQLite instead of in-memory.

🔹Steps for Implementation

1. Create a new table in SQLite to store failed login attempts.

2. First 2 failed attempts have no delay.

3. Next failures introduce an exponential backoff (5s → 10s → 20s → 40s → max 5 min).

4. On successful login, reset failed attempts in the database.

#### Add Failed Attempts Table in `database.ts`

Add this to the database setup:
```ts
await db.exec(`
  CREATE TABLE IF NOT EXISTS failed_logins (
    user_id INTEGER PRIMARY KEY,
    attempts INTEGER DEFAULT 0,
    last_attempt INTEGER,
    next_try INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);
```
This table will:
- Store failed login attempts per user.
- Track last attempt time.
- Store the next allowed login time.

#### Configure SQLite Rate Limiting in `authRoutes.ts`

Modify the `/login` route:
```ts
import { FastifyInstance } from 'fastify';
import { LoginRequest } from "../schemas/userSchema.js";
import bcrypt from 'bcrypt';
import sanitizeHtml from 'sanitize-html';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: LoginRequest }>("/login", async (req, reply) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return reply.status(400).send({ error: "Email or password required." });
      }

      // 🔍 Allow login with either email or username
      const stmt = await fastify.db.prepare("SELECT * FROM users WHERE email = ? OR username = ?");
      const user = await stmt.get(email, email);

      if (!user) return reply.status(401).send({ error: "Invalid email/username" });

      const now = Date.now();
      const userId = user.id;

      // 🔒 Check login attempts from SQLite
      const stmtCheck = await fastify.db.prepare("SELECT * FROM failed_logins WHERE user_id = ?");
      const failedLogin = await stmtCheck.get(userId);

      if (failedLogin && failedLogin.next_try > now) {
        const waitTime = Math.ceil((failedLogin.next_try - now) / 1000);
        return reply.status(429).send({ error: `Too many attempts. Try again in ${waitTime}s.` });
      }

      // 🔐 Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        let attempts = failedLogin ? failedLogin.attempts + 1 : 1;
        let nextTry = now;

        // Gradual increase in wait time: No delay for first 2 attempts, then double delay
        if (attempts > 2) {
          const delay = Math.min(5 * 2 ** (attempts - 3), 300); // Max wait time 5 min
          nextTry = now + delay * 1000;
        }

        // 🔄 Update failed login attempts in SQLite
        if (failedLogin) {
          const stmtUpdate = await fastify.db.prepare("UPDATE failed_logins SET attempts = ?, last_attempt = ?, next_try = ? WHERE user_id = ?");
          await stmtUpdate.run(attempts, now, nextTry, userId);
        } else {
          const stmtInsert = await fastify.db.prepare("INSERT INTO failed_logins (user_id, attempts, last_attempt, next_try) VALUES (?, ?, ?, ?)");
          await stmtInsert.run(userId, attempts, now, nextTry);
        }

        return reply.status(401).send({ error: "Invalid password" });
      }

      // ✅ Successful login → Reset failed attempts
      const stmtReset = await fastify.db.prepare("DELETE FROM failed_logins WHERE user_id = ?");
      await stmtReset.run(userId);

      // Set user status to "online"
      const updateStmt = await fastify.db.prepare("UPDATE users SET status = ? WHERE id = ?");
      await updateStmt.run("online", userId);

      reply.send({ message: "✅ Login successful", user: { id: user.id, username: user.username, email: user.email, status: "online" } });
    } catch (error) {
      console.error("❌ Login error:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });
}
```
How This Works
1. First 2 failed attempts = No delay.
2. Next failures introduce exponential delays (5s → 10s → 20s → 40s → max 5 min).
3. Rate limiting is stored in SQLite so it persists across server restarts.
4. On successful login, failed attempts reset.

Pros of This Approach
- Persists even if the server restarts.
- More secure than in-memory tracking.
- Uses SQLite efficiently (Indexed by user_id).
- Handles users deleting their accounts properly.

---

## 🛡 Hash Passwords Securely

Never store passwords in plain text.

### Solution: Hash Passwords with Bcrypt

```ts
// in authRoutes.ts

import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12); // Secure hashing
```
Why?\
bcrypt.hash(password, 12) makes password cracking very slow for attackers.\
12 rounds is a good balance between security and performance.

Example with Password Update Route in `authRoutes.ts`
```ts
fastify.put<{ Body: { id: number, oldPassword: string, newPassword: string } }>("/update-password", async (req, reply) => {
  try {
    const { id, oldPassword, newPassword } = req.body;

    if (!id || !oldPassword || !newPassword) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    // 🔍 Fetch user
    const stmt = await fastify.db.prepare("SELECT password FROM users WHERE id = ?");
    const user = await stmt.get(id);
    if (!user) return reply.status(404).send({ error: "User not found" });

    // 🔒 Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return reply.status(401).send({ error: "Incorrect password" });

    // 🔐 Hash new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updateStmt = await fastify.db.prepare("UPDATE users SET password = ? WHERE id = ?");
    await updateStmt.run(hashedPassword, id);

    reply.send({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error updating password:", error);
    reply.status(500).send({ error: "Internal Server Error" });
  }
});
```
Why?\
Verifies old password before allowing a change.\
Hashes the new password before saving it.

---

## 🛡 Use Secure HTTP Headers

XSS can also be exploited via insecure headers.

### Solution: Use Fastify Helmet

Fastify Helmet sets secure HTTP headers to protect against:

- Clickjacking
- XSS
- Content Security Policy (CSP) violations

Install Helmet
```sh
npm install @fastify/helmet
```
Use Helmet in `server.ts`
```ts
import helmet from "@fastify/helmet";
await fastify.register(helmet);
```
Why?\
Prevents malicious scripts from running on your site.

---

## 🛡 Use HTTPS

If your site does not use HTTPS, data can be stolen via Man-in-the-Middle (MITM) attacks.

### Solution: Use SSL Certificates

If you're running locally, you can generate self-signed certificates:
```sh
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```
Modify `server.ts` to enable HTTPS:
```ts
const fastify = Fastify({
  https: {
    key: fs.readFileSync("./certs/key.pem"),
    cert: fs.readFileSync("./certs/cert.pem"),
  }
});
```
Why?\
This encrypts traffic, protecting passwords and user data from attackers.

---


