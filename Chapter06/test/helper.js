import { fastify } from 'fastify';
import appPlugin, { options } from '../app.js';

const defaultTestEnv = {
  NODE_ENV: 'test',
  API_KEY: 'test-suite',
  DATABASE_URL: 'mongodb://localhost:27017/restaurant-test-run'
};

async function buildApplication (env, serverOptions = { logger: false }) {
  const testServerOptions = Object.assign({}, options, serverOptions);
  const testEnv = Object.assign({}, defaultTestEnv, env);

  const app = fastify(testServerOptions);
  app.register(appPlugin, { applicationEnv: testEnv });

  return app;
}

export { buildApplication };
