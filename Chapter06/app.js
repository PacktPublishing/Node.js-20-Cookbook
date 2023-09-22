import configPlugin from './plugins/config.js';
import datasourcePlugin from './plugins/datasource.js';
import authPlugin from './plugins/auth.js';

import recipesPlugin from './routes/recipes.js';
import ordersPlugin from './routes/orders.js';

const options = {
  logger: true,
  ajv: {
    customOptions: {
      allErrors: true
    }
  }
};

async function appPlugin (app, opts) {
  app.addHook('onReady', async function hook () {
    this.log.info(`onReady runs from file ${import.meta.url}`);
  });

  app.addHook('onClose', async function hook (app) {
    app.log.info(`onClose runs from file ${import.meta.url}`);
  });

  app.get('/', async function homeHandler () {
    return {
      api: 'fastify-restaurant-api',
      version: 1
    };
  });

  await app.register(configPlugin, opts);
  app.register(datasourcePlugin, { databaseUrl: app.appConfig.DATABASE_URL });
  app.register(authPlugin, { tokenValue: app.appConfig.API_KEY });
  app.register(recipesPlugin);
  app.register(ordersPlugin);
}

export default appPlugin;
export { options };
