// [1]
import { test } from 'node:test';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';

import { buildApplication } from './helper.js';

test('GET /', async function (t) {
  const app = await buildApplication();

  t.after(async function () {
    await app.close();
  });

  const response = await app.inject({
    method: 'GET',
    url: '/'
  });
  strictEqual(response.statusCode, 200);
  deepStrictEqual(response.json(), {
    api: 'fastify-restaurant-api',
    version: 1
  });
});

test('Only a Chef can create a recipe', async function (t) {
  const testApiKey = 'test-suite-api-key';
  const app = await buildApplication({
    API_KEY: testApiKey
  });

  t.after(async function () {
    await app.close();
  });

  const pizzaRecipe = { name: 'Pizza', country: 'ITA', price: 8, order: 2 };

  const notChefResponse = await app.inject({
    method: 'POST',
    url: '/recipes',
    payload: pizzaRecipe,
    headers: {
      'x-api-key': 'invalid-key'
    }
  });
  strictEqual(notChefResponse.statusCode, 401);

  const response = await app.inject({
    method: 'POST',
    url: '/recipes',
    payload: pizzaRecipe,
    headers: {
      'x-api-key': testApiKey
    }
  });
  strictEqual(response.statusCode, 201);

  const recipeId = response.json().id;

  const menu = await app.inject('/menu');
  strictEqual(menu.statusCode, 200);
  const recipes = menu.json();
  const expectedPizza = recipes.find(r => r.id === recipeId);
  ok(expectedPizza, 'Pizza recipe must be found');
});

test('Create an order and mark it as done', async function (t) {
  const testApiKey = 'test-suite-api-key';

  const app = await buildApplication({
    DATABASE_URL: `mongodb://localhost:27017/test_${Date.now()}`,
    API_KEY: testApiKey
  });

  t.after(async function () { await app.close(); });

  const pizzaRecipe = { name: 'Pizza', country: 'ITA', price: 8, order: 2 };

  const response = await app.inject({
    method: 'POST',
    url: '/recipes',
    payload: pizzaRecipe,
    headers: { 'x-api-key': testApiKey }
  });
  strictEqual(response.statusCode, 201);

  const recipeId = response.json().id;

  const order = {
    table: 1,
    dishes: [
      { id: recipeId, quantity: 2 }
    ]
  };

  const orderResponse = await app.inject({
    method: 'POST',
    url: '/orders',
    payload: order
  });
  strictEqual(orderResponse.statusCode, 201);

  {
    const orderList = await app.inject('/orders');
    strictEqual(orderList.statusCode, 200);
    const orders = orderList.json();
    const expectedOrder = orders.find(o => o.id === orderResponse.json().id);
    ok(expectedOrder, 'Order must be found');
  }

  const doneResponse = await app.inject({
    method: 'PATCH',
    url: `/orders/${orderResponse.json().id}`,
    headers: { 'x-api-key': testApiKey }
  });
  strictEqual(doneResponse.statusCode, 204);

  {
    const orderList = await app.inject('/orders');
    strictEqual(orderList.statusCode, 200);
    const orders = orderList.json();
    strictEqual(orders.length, 0);
  }
});
