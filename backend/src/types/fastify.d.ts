import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    isAuthorized: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      id: number;
      username: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: number; username: string }; // used when signing
    user: { id: number; username: string };    // used after verification
  }
}
