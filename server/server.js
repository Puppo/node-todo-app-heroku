
require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticated} = require('./middleware/authenticated');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.post(`/todos`, authenticated, async (req, res) => {
  try {
    const todo = new Todo({
      text: req.body.text,
      _creator: req.user._id
    });
    const doc = await todo.save();
    return res.send(doc);
  } catch (e) {
    res.status(400).send();
  }
});

app.get('/todos', authenticated, async (req, res) => {
  try {
    const todos = await Todo.find({_creator: req.user._id});
    return res.send({todos});
  } catch (e) {
    return res.status(400).send();
  }
});

app.get('/todos/:id', authenticated, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    const todo = await Todo.findOne({
      _id: id,
      _creator: req.user._id
    });
    
    if (!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  } catch(e) {
    return res.status(400).send();
  }
});

app.delete('/todos/:id', authenticated, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  } catch(e) {
    return res.status(400).send();
  }
});

app.patch('/todos/:id', authenticated, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);
    
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    const todo = await Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {$set: body}, {new: true});
    if(!todo) {
      return res.status(404).send();
    }
    return res.send({todo});
  } catch(e) {
    return res.status(400).send();
  }
});

app.post(`/users`, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    return res.header('x-auth', token).send(user);
  } catch(e) {
    return res.status(400).send();
  }
});

app.get('/users/me', authenticated, (req, res) => {
  return res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredential(body.email, body.password);
    const token = await user.generateAuthToken();
    return res.header('x-auth', token).send(user);
  } catch(e) {
    return res.status(400).send();
  }
});

app.delete('/users/me/token', authenticated, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    return res.send()
  } catch(e) {
    return res.status(400).send();
  }
});

app.listen(PORT, () => {
  console.log(`app run on port ${PORT}`);
})

module.exports = { app };
