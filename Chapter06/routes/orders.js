async function ordersPlugin (app, opts) {
  async function notImplemented (request, reply) {
    throw new Error('Not implemented');
  }

  const orderJsonSchema = {
    type: 'object',
    required: ['table', 'dishes'],
    properties: {
      table: { type: 'number', minimum: 1 },
      dishes: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['id', 'quantity'],
          properties: {
            id: { type: 'string', minLength: 24, maxLength: 24 },
            quantity: { type: 'number', minimum: 1 }
          }
        }
      }
    }
  };

  app.post('/orders', {
    schema: {
      body: orderJsonSchema
    },
    handler: async function createOrder (request, reply) {
      const order = {
        status: 'pending',
        createdAt: new Date(),
        items: request.body.dishes
      };

      const orderId = await this.source.insertOrder(order);
      reply.code(201);
      return { id: orderId };
    }
  });

  const orderListSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              order: { type: 'number' },
              quantity: { type: 'number' }
            }
          }
        }
      }
    }
  };

  app.get('/orders', {
    schema: {
      response: {
        200: orderListSchema
      }
    },
    handler: async function readOrders (request, reply) {
      const orders = await this.source.readOrders({ status: 'pending' });

      const recipesIds = orders.flatMap(order => order.items.map(item => item.id));
      const recipes = await this.source.readRecipes({ id: { $in: recipesIds } });

      return orders.map(order => {
        order.items = order.items
          .map(item => {
            const recipe = recipes.find(recipe => recipe.id === item.id);
            return recipe ? { ...recipe, quantity: item.quantity } : undefined;
          })
          .filter(recipe => recipe !== undefined);
        return order;
      });
    }
  });

  // todo
  app.patch('/orders/:orderId', {
    config: { auth: true },
    handler: notImplemented
  });
}

export default ordersPlugin;
