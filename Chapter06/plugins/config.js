
import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

async function configPlugin (app, opts) {
  const envSchema = {
    type: 'object',
    required: ['API_KEY', 'DATABASE_URL'],
    properties: {
      NODE_ENV: { type: 'string', default: 'development' },
      PORT: { type: 'integer', default: 3000 },
      API_KEY: { type: 'string' },
      DATABASE_URL: { type: 'string' }
    }
  };

  app.register(fastifyEnv, {
    confKey: 'appConfig',
    schema: envSchema,
    data: opts.applicationEnv
  });
}

export default fp(configPlugin);
