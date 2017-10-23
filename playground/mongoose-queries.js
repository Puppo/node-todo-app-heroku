
const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

// const id = '59ee09d5f808501723a55887';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({_id: id})
// .then(todos => console.log('Todos', todos));

// Todo.findOne({_id: id})
// .then(todo => console.log('Todo', todo));

// Todo.findById(id)
// .then(todo => {
//   if (!todo) {
//     return console.log('Id not found.');
//   }
//   console.log('Todo By Id', todo);
// })
// .catch(e => console.log(e));

User.findById('59edd42b0a24cc0e4faf0e44')
.then(user => {
  if (!user) {
    return console.log('Unable to find user.');
  }

  console.log(JSON.stringify(user, undefined, 2));
},
err => console.log(err));
