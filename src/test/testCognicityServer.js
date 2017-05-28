import { init } from '../server.js';
const test = require('unit.js');

// Mocker object for app
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ raw: true }),
  ]
});

describe('Events endpoint', function() {
  it('Gets events', function(done){

    init(logger).then((app) => {
      test.httpAgent(app)
        .get('/events')
        .expect('Content-Type', /json/)
        //.expect('Content-Length', '20')
        .expect(200)
        .end(function(err, res){
          if (err) {
            test.fail(err.message);
          }
          else {
            done();
          }
        });
      });
    });
});
