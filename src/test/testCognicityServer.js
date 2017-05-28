//const request = require('supertest');
//const assert = require('chai');
//import Promise from 'bluebird';
import { init } from '../main.js';
//import { test } from 'unit.js';
const test = require('unit.js');

//app = init();
//app = 1;

describe('GET /user', function() {
  it('does something', function(done){

    //init().then((app) => {

    //});

    let a = 1;
    test.value(a).is(1);
    done();
  })
  /*
  it('respond with json', function(done) {
    init().then((app) => {
      request(app)
        .get('/user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });*/
});
