const request = require('supertest');
const assert = require('chai').assert;
require('it-each')();

import { init } from '../../..';

// Setup an array of tests to run
const tests = [
  {
    url: '/events',
    exp: {
      status: 200
    }
  },
  {
    url: '/events?geoformat=geojson',
    exp: {
      status: 200
    }
  },
  {
    url: '/reports/9999',
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
