
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.post(`/todos`, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });

  todo.save().then(doc => res.send(doc)
  , err => res.status(400).send(err));
});

app.get('/todos', (req, res) => {
  Todo.find().then(todos => res.send({todos}), err => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
  .then(todo => {
    if (!todo) {
      return res.status(404).send();
    }
    return res.send(todo);
  })
  .catch(err => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
  .then(todo => {
    if (!todo) {
      return res.status(404).send();
    }

    return res.send(todo);
  })
  .catch(e => res.status(400).send())

});

app.listen(PORT, () => {
  console.log(`app run on port ${PORT}`);
})

module.exports = { app };
