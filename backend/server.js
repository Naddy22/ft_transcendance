// backend/server.js
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

// Define a simple route
fastify.get('/', async (request, reply) => {
    return { message: 'Hello, Fastify with Docker!' };
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
