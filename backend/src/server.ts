
// import Fastify from 'fastify';
// import dotenv from 'dotenv';
// import userRoutes from './routes/userRoutes.js';

const Fastify = require('fastify');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
const app = Fastify({ logger: true });

import { FastifyRequest, FastifyReply } from 'fastify';

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { message: 'Backend is running!' };
});

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
