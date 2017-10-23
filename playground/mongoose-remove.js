
const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');

Todo.remove({}).then(res => console.log(res))

Todo.findOneAndRemove({_id: '59ee5de7b5e8593496d70a72'}).then(todo => console.log(todo));;
Todo.findByIdAndRemove('59ee5de7b5e8593496d70a72').then(todo => console.log(todo));
