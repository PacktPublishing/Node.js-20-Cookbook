import { fastify } from 'fastify';
import appPlugin, { options } from './app.js';

const app = fastify(options);
app.register(appPlugin, {
  applicationEnv: {
    API_KEY: 'fastify-rocks',
    DATABASE_URL: 'mongodb://localhost:27017/restaurant',
    ...process.env
  }
});
const port = process.env.PORT || 3000;
await app.listen({ host: '0.0.0.0', port });
