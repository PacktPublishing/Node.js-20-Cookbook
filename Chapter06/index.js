import { fastify } from 'fastify';

const app = fastify({
  logger: true
});

app.get('/', async function homeHandler () {
  return {
    api: 'fastify-restaurant-api',
    version: 1
  };
});

const port = process.env.PORT || 3000;
await app.listen({ host: '0.0.0.0', port });
