
const request = require('supertest');
const expect = require('expect.js');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
},{
  _id: new ObjectID(),
  text: 'Second test todo'
}]

beforeEach(done => {
  Todo.remove({})
  .then(res => Todo.insertMany(todos))
  .then(res => done());
})

describe('POST /todos', () => {
  it('should create a new todo', done => {
    const text = 'Test todo test';
    request(app)
    .post('/todos')
    .send({text})
    .expect(200)
    .expect((res) => {
      expect(res.body.text).to.be(text);
    })
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      Todo.find().then(todos => {
        expect(todos.length).to.be(3);
        expect(todos[2].text).to.be(text);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should not create todo with invalid body data', done => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      Todo.find().then(todos => {
        expect(todos.length).to.be(2);
        done();
      })
      .catch(e => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('should get all todos', done => {
    request(app)
    .get('/todos')
    .expect(200)
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      expect(res.body.todos.length).to.be(2);
      done();
    });
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect(res => expect(res.body.text).to.be(todos[0].text))
    .end(done);
  });

  it('should return 404 if todo not found', done => {
    const hexId = new ObjectID().toHexString();
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
    it('should return 404 for non-object ids', done => {
      request(app)
      .get(`/todos/123abc`)
      .expect(404)
      .end(done);
    });
});
