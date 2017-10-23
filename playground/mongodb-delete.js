
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (!!err) {
    return console.log('Unable to connect to MongoDB server.');
  }
  console.log('Connected to MongoDB server.');

  // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then(result => {
  //   console.log(result);
  // }, err => {
  //   console.log('Unable to delete data');
  // });

  // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then(result => {
  //   console.log(result);
  // }, err => {
  //   console.log('Unable to delete data');
  // });

  // db.collection('Todos').findOneAndDelete({text: 'Eat lunch'}).then(result => {
  //   console.log(result);
  // }, err => {
  //   console.log('Unable to delete data');
  // });

  db.collection('Users').deleteMany({name: 'Luca'});
  db.collection('Users').findOneAndDelete({_id: new ObjectID('59edb79eb5e8593496d6ff65')})
  .then(results => console.log(JSON.stringify(results, undefined, 2)));

  db.close();
});
