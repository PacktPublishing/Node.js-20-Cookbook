function recipesPlugin (app, opts, next) {
  app.get('/menu', { handler: menuHandler });
  app.get('/recipes', { handler: menuHandler });

  const jsonSchemaBody = {
    type: 'object',
    required: ['name', 'country', 'order', 'price'],
    properties: {
      name: { type: 'string', minLength: 3, maxLength: 50 },
      country: { type: 'string', enum: ['ITA', 'IND'] },
      description: { type: 'string' },
      order: { type: 'number', minimum: 0, maximum: 100 },
      price: { type: 'number', minimum: 0, maximum: 50 }
    }
  };

  app.post('/recipes', {
    config: { auth: true },
    schema: {
      body: jsonSchemaBody
    },
    handler: async function addToMenu (request, reply) {
      const { name, country, description, order, price } = request.body;
      const newPlateId = await app.source.insertRecipe({
        name,
        country,
        description,
        order,
        price,
        createdAt: new Date()
      });

      reply.code(201);
      return { id: newPlateId };
    }
  });

  app.delete('/recipes/:id', {
    config: { auth: true },
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', minLength: 24, maxLength: 24 }
        }
      }
    },
    handler: async function removeFromMenu (request, reply) {
      const { id } = request.params;
      const [recipe] = await app.source.readRecipes({ id });
      if (!recipe) {
        reply.code(404);
        throw new Error('Not found');
      }
      await app.source.deleteRecipe(id);
      reply.code(204);
    }
  });

  next();
}

async function menuHandler (request, reply) {
  const recipes = await this.source.readRecipes();
  return recipes;
}

export default recipesPlugin;
