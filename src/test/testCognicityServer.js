//const request = require('supertest');
//const assert = require('chai').assert;
import Promise from 'bluebird';
import { init } from '../index.js';

//app = init();
//app = 1;

describe('GET /user', function() {
  it('respond with json', function(done) {
    init().then((app) => {
      request(app)
        .get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
});
