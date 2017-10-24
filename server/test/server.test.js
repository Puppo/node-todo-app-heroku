
const request = require('supertest');
const should = require('should');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /user/me', () => {
  it('should return user if authenticated', done => {
    request(app)
    .get('/users/me')
    .set('x-auth', users[0].tokens[0].token)
    .send()
    .expect(200)
    .expect(res => {
      should(res.body._id).be.equal(users[0]._id.toHexString());
      should(res.body.email).be.equal(users[0].email);
    })
    .end(done);
  });

  it('should return 401 if not authenticated', done => {
    request(app)
    .get('/users/me')
    .send()
    .expect(401)
    .end(done);
  });

});

describe('POST /users', () => {
  it('should create user', done => {
    const email = 'example@axample.com'
        , password = '123mnb!';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(200)
    .expect(res => {
      should(res.headers['x-auth']).not.null();
      should(res.body._id).not.null();
      should(res.body.email).be.equal(email);
    })
    .end((err) => {
      if (!!err) {
        return done(err);
      }

      User.findOne({email})
      .then(user => {
        should(user).not.null();
        should(user.password).not.be.equal(password);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should return validation error if request invalid', done => {
    const email = 'example@axample.com'
    , password = '123!';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });

  it('should not create user if email in use', done => {
    const email = users[0].email
    , password = '123mnb!';
    request(app)
    .post('/users')
    .send({email, password})
    .expect(400)
    .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', done => {
    const email = users[1].email
        , password = users[1].password;

    request(app)
    .post('/users/login')
    .send({email, password})
    .expect(200)
    .expect(res => {
      should(res.headers['x-auth']).not.null();
    })
    .end((err, res) => {
      if (!err) {
        return done(err);
      }

      User.findById(users[1]._id)
      .then(user => {
        should(user.tokens[0]).containEql({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      })
    });
  });

  it('should reject invalid login', done => {
    const email = users[1].email
    , password = '123abc!';

    request(app)
    .post('/users/login')
    .send({email, password})
    .expect(400)
    .expect(res => {
      should(res.headers['x-auth']).null();
    })
    .end((err, res) => {
      if (!err) {
        return done(err);
      }

      User.findById(users[1]._id)
      .then(user => {
        should(user.tokens.length).equal(0);
        done();
      });
    });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', done => {
    request(app)
    .delete('/users/me/token')
    .set('x-auth', users[0].tokens[0].token)
    .send()
    .expect(200)
    .end((err, res) => {
      if (!!err) {
        return done(err);
      }

      User.findById(users[0]._id.toHexString())
      .then(user => {
        should(user.tokens.length).be.equal(0);
        done();
      })
      .catch(e => done(e));
    });
  });

  it('should return 401 if not authenticated', done => {
    request(app)
    .delete('/users/me/token')
    .send()
    .expect(401)
    .end(done);
  });
});
