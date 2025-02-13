import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv'

dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Register JWT plugin
fastify.register(jwt, { secret: process.env.JWT_SECRET });

// Health Check Route
fastify.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify with Docker and SQLite!' };
});

// Route to get all users
fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany({
		select: { id: true, name: true, email: true, createdAt: true },
	});
    return users;
});

// Route to register a user (with password hashing)
fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body;

	// Check if email already exists
	const existingUser = await prisma.user.findUnique({ where: { email } });
	if (existingUser) {
		return reply.status(400).send({ error: 'Email already in use' });
	}

	// Hash the password before storing
	const hashedPassword = await bcrypt.hash(password, 10);
	
	// Store the new user
    const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
		select: { id:true, name: true, email: true },
    });

    return reply.status(201).send(newUser);
});

// Login and Get JWT Token
fastify.post('/login', async (request, reply) => {
	const { email, password } = request.body;

	// Find user by email
	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true, password: true }
	});

	console.log("User found in DB:", user); // 🛠 Debugging log

	if (!user) {
		return reply.status(401).send({ error: 'Invalid email or password' });
	}

	if (!user.password) {
        return reply.status(500).send({ error: 'Password field is missing in DB' });
    }

	// Compare password
	const isValidPassword = await bcrypt.compare(password, user.password);
	if (!isValidPassword) {
		return reply.status(401).send({ error: 'Invalid email or password' });
	}

	// Generate JWT token
	const token = fastify.jwt.sign({ id: user.id, email: user.email });

	return { token };
});

// Middleware for Protected Routes
fastify.decorate("authenticate", async (request, reply) => {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.send(err);
	}
});

// Protected Route: Get User Profile
fastify.get('/profile', { preValidation: [fastify.authenticate] }, async (request, reply) => {
	const user = await prisma.user.findUnique({
		where: { id: request.user.id },
		select: { id: true, name: true, email: true, createdAt: true }
	});

	if (!user) {
		return reply.status(404).send({ error: 'User not found' });
	}

	return user;
});


// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Fastify server running on http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
