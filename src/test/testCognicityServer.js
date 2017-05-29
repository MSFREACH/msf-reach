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
 it('Starts server', function(done){
	init(logger).then((app) => {
		describe('Events endpoint', function() {

			// Holding variables
			// TODO - should this go in a before()?
			let event_id = 0;
			let report_key = 'key';

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
					let agent = test.httpAgent(app);
						agent.post('/events')
						.send({
								"status": "active",
								"type": "flood",
								"created": "2017-05-22T20:35Z",
								"location":{
									"lat":45,
									"lng":140
								},
								"metadata":{
									"user":"integrated tester"
								}
						})
						.expect(200)
						.expect('Content-Type', /json/)

						.end(function(err, res){
							if (err) {
								test.fail(err.message);
							}
							else {
									event_id = res.body.result.objects.output.geometries[0].properties.id;
									report_key = res.body.result.objects.output.geometries[0].properties.report_key;
									done()
							}
								//done();
							})
							//else {
							//	done();
							//}
					});
			//});

			it('Get the event that was just created (GET /events/:id)', function(done){
				test.httpAgent(app)
					.get('/events/' + event_id)
					.expect(200)
					.expect('Content-Type', /json/)
					.end(function(err, res){
						if (err) {
							test.fail(err.message);
						}
						else {
							test.value(res.body.result.objects.output.geometries[0].properties.metadata.user).is('integrated tester');
							test.value(res.body.result.objects.output.geometries[0].properties.report_key).is(report_key);
							done();
						}
				});
			});
		return (done())})
	});
});
});
