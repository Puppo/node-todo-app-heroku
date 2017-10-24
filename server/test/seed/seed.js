
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('../../models/user');
const {Todo} = require('../../models/todo');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'one@user.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  }, {
    _id: userTwoId,
    email: 'two@user.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  }
];

const populateUsers = done => {
  User.remove({})
  .then(res => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]);
  })
  .then(res => done());
};

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
},{
  _id: new ObjectID(),
  text: 'Second test todo',
  _creator: userTwoId
}];

const populateTodos = done => {
  Todo.remove({})
  .then(res => Todo.insertMany(todos))
  .then(res => done());
};

module.exports = {todos, populateTodos, users, populateUsers};
