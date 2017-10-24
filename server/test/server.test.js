
const request = require('supertest');
const should = require('should');
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
      should(res.body.text).be.equal(text);
    })
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      Todo.find().then(todos => {
        should(todos.length).be.equal(3);
        should(todos[2].text).be.equal(text);
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
        should(todos.length).be.equal(2);
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

      should(res.body.todos.length).be.equal(2);
      done();
    });
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', done => {
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect(res => should(res.body.todo.text).be.equal(todos[0].text))
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

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const hexId = todos[1]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect(res => should(res.body.todo._id).be.equal(hexId))
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      Todo.findById(hexId)
      .then(todo => {
        should(todo).be.equal(null);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should return 404 if todo not found', done => {
    const hexId = new ObjectID();
    request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
  it('should return 404 if object id is invalid', done => {
    request(app)
    .delete(`/todos/123abc`)
    .expect(404)
    .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const hexId = todos[1]._id.toHexString();
    const text = 'This should be the new text'
          , completed = true;

    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed,
      text
    })
    .expect(200)
    .expect(res => {
      should(res.body.todo.text).be.equal(text);
      should(res.body.todo.completed).be.equal(completed);
      should(res.body.todo.completedAt).be.a.Number();
    })
    .end(done);
  });

  it('should clear completedAt when todo is not completed', done => {
    const hexId = todos[1]._id.toHexString();
    const text = 'This should be the new text'
          , completed = false;

    request(app)
    .patch(`/todos/${hexId}`)
    .send({
      completed,
      text
    })
    .expect(200)
    .expect(res => {
      should(res.body.todo.text).be.equal(text);
      should(res.body.todo.completed).be.equal(completed);
      should(res.body.todo.completedAt).not.be.ok();
    })
    .end(done);
  });

  it('should return 404 if todo not found', done => {
    const hexId = new ObjectID();
    request(app)
    .patch(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });
  
  it('should return 404 if object id is invalid', done => {
    request(app)
    .patch(`/todos/123abc`)
    .expect(404)
    .end(done);
  });
});
