import { init } from '../server.js';
const test = require('unit.js');

// Mocker object for app
const winston = require('winston');
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ raw: true }),
  ]
});

describe('Cognicity Server Testing Harness', function() {
 it('Server is started', function(done){
	init(logger).then((app) => {
		describe('Events endpoint', function() {

			beforeEach(function(){
				this.event_id = 0;
				this.report_key = 'key';
			});

			it('GET /events', function(done){
					test.httpAgent(app)
						.get('/events')
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
		          if (err) {
		            test.fail(err.message);
		          }
		          else {
		            done();
		          }
					});
	    });

			it('Create an event (POST /events)', function(done){
					test.httpAgent(app)
						.post('/events')
						.send({
								"status": "active",
								"type": "flood",
								"created": "2017-05-22T20:35Z",
								"location":{
									"lat":45,
									"lng":140
								},
								"metadata":{
									"user":"tester"
								}
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message);
							}
							else {
								done();
							}
					});
			});

			it('Get an event (GET /events/:id)', function(done){
				test.httpAgent(app)
					.get('/events/27')
					.expect(200)
					.expect('Content-Type', /json/)
					//.expect(function(res){
					//	res.body.id = this.event_id;
					//})
					.end(function(err, res){
						if (err) {
							test.fail(err.message);
						}
						else {
							done();
						}
				});
			});
		return (done())})
	});
});
});
