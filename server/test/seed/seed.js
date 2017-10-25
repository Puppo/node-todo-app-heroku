
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

const populateUsers = async (done) => {
  await User.remove({});
  await new User(users[0]).save();
  await new User(users[1]).save();
  done();
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
  await Todo.remove({});
  await Todo.insertMany(todos);
  done();
};

module.exports = {todos, populateTodos, users, populateUsers};
