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
