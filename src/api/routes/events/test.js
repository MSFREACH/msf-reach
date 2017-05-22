const request = require('supertest');
const assert = require('chai').assert;
require('it-each')();

import { init } from '../../..';

// Setup an array of tests to run
const tests = [
  {
    url: '/reports',
    exp: {
      status: 200
    }
  },
  {
    url: '/reports?city=jbd',
    exp: {
      status: 200
    }
  },
  {
    url: '/reports?city=xxx',
    exp: {
      status: 400
    }
  },
  {
    url: '/reports/1',
    exp: {
      status: 404
    }
  }
];

// Run the tests
describe('GET /reports', () => {
  it.each(tests, 'respond with correct response for test', (test, next) => {
    init().then((app) => {
      request(app)
        .get(test.url)
        .end((err, res) => {
          if (err) next(err);
          assert.equal(res.status, test.exp.status);
          return next();
        });
    });
  });
});
