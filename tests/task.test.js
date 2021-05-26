const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { userOne, taskTwo, userZero, setupDB } = require('../tests/fixtures/db');

beforeEach(setupDB);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send({
      description: "Some sample task"
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
});

test('Should get all tasks for user zero', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(2);
});

test('Should not delete task of other user', async () => {
  const taskId = taskTwo._id;
  await request(app)
    .get(`/tasks/${taskId}`)
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send()
    .expect(404);
  const task = await Task.findById(taskId);
  expect(task).not.toBeNull();
});