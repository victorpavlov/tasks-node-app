const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { userZeroId, userZero, setupDB } = require('../tests/fixtures/db');

beforeEach(setupDB);

test('Should signup a new user', async () => {
  const user = {
    name: "Victor",
    age: 101,
    email: "vitekpavlov@gmail.com",
    password: "pass123pass"
  };
  await request(app).post('/users').send(user).expect(201);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({...userZero})
    .expect(200);
  const user = await User.findById(userZeroId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login not existing user', async () => {
  const credentials = {
    email: 'dummy@mail.com',
    password: '123456',
  };
  await request(app).post('/users/login').send(credentials).expect(400);
});

test('Should get authenticated user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get user profile if unauthenticated', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('Should delete authenticated user profile', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send()
    .expect(200);
  const user = await User.findById(userZeroId);
  expect(user).toBeNull();
});

test('Should not delete user profile if unauthenticated', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/CnDRR_title.jpg')
    .expect(200);
  const user = await User.findById(userZeroId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  const newUserName = 'Joe';
  await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send({
      name: newUserName
    })
    .expect(200);
  const user = await User.findById(userZeroId);

  expect(user.name).toBe(newUserName);
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me/')
    .set('Authorization', `Bearer ${userZero.tokens[0].token}`)
    .send({
      token: 'Joe'
    })
    .expect(400);
});
