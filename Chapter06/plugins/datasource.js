import fp from 'fastify-plugin';
import fastifyMongo from '@fastify/mongodb';

async function datasourcePlugin (app, opts) {
  app.log.info('Connecting to MongoDB');
  app.register(fastifyMongo, {
    forceClose: true,
    minPoolSize: 10,
    maxPoolSize: 20,
    url: opts.databaseUrl
  });

  app.decorate('source', {
    async insertRecipe (recipe) {
      const { db } = app.mongo;
      const _id = new app.mongo.ObjectId();
      recipe._id = _id;
      recipe.id = _id.toString();
      const collection = db.collection('menu');
      const result = await collection.insertOne(recipe);
      return result.insertedId;
    },

    async readRecipes (filters, sort = { order: 1 }) {
      const collection = app.mongo.db.collection('menu');
      const result = await collection
        .find(filters, { projection: { _id: 0 } })
        .sort(sort).toArray();
      return result;
    },

    async deleteRecipe (recipeId) {
      const collection = app.mongo.db.collection('menu');
      const result = await collection.deleteOne({ _id: new app.mongo.ObjectId(recipeId) });
      return result.deletedCount;
    },

    async insertOrder (order) {
      const _id = new app.mongo.ObjectId();
      order._id = _id;
      order.id = _id.toString();
      const collection = app.mongo.db.collection('orders');
      const result = await collection.insertOne(order);
      return result.insertedId;
    },

    async readOrders (filters, sort = { createdAt: -1 }) {
      const collection = app.mongo.db.collection('orders');
      const result = await collection
        .find(filters, { projection: { _id: 0 } })
        .sort(sort).toArray();
      return result;
    },

    async markOrderAsDone (orderId) {
      const collection = app.mongo.db.collection('orders');
      const result = await collection.updateOne(
        { _id: new app.mongo.ObjectId(orderId) },
        { $set: { status: 'done' } }
      );
      return result.modifiedCount;
    }
  });
}

export default fp(datasourcePlugin);
