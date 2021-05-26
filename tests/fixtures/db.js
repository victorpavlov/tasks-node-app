const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userZeroId = mongoose.Types.ObjectId();
const userZero = {
  _id: userZeroId,
  name: "Zero",
  age: 101,
  email: "zero@gmail.com",
  password: "pass123pass",
  tokens: [{
    token: jwt.sign({_id: userZeroId}, process.env.JWT_SECRET)
  }]
};

const userOneId = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "One",
  age: 101,
  email: "One@gmail.com",
  password: "pass123pass",
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
};

const taskZero = {
  _id: mongoose.Types.ObjectId(),
  description: "Example task zero description",
  completed: false,
  owner: userZeroId
}

const taskOne = {
  _id: mongoose.Types.ObjectId(),
  description: "Example task one description",
  completed: true,
  owner: userZeroId
}

const taskTwo = {
  _id: mongoose.Types.ObjectId(),
  description: "Example task two description",
  completed: true,
  owner: userOneId
}

const setupDB = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userZero).save();
  await new User(userOne).save();
  await new Task(taskZero).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
};

module.exports = {
  userZeroId,
  userZero,
  userOneId,
  userOne,
  taskTwo,
  setupDB
};