import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Define a simple route
fastify.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify with Docker!' };
});

// Route to get all users
fastify.get('/users', async (request, reply) => {
    const users = await prisma.user.findMany();
    return users;
});

// Route to create a user
fastify.post('/users', async (request, reply) => {
    const { name, email } = request.body;
    const newUser = await prisma.user.create({
        data: { name, email }
    });
    return newUser;
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
