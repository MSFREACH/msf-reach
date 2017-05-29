// Testing for CogniCity MSF Server
// Unit tests run together against live app, and database
// Data is passed between tests for form integration tests

// Import Unit.js
const test = require('unit.js');

// Import server object
import { init } from '../server.js';

// Mocker object for app
const winston = require('winston');
const logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ raw: true }),
	]
});

// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {
 it('Server starts', function(done){
	init(logger).then((app) => {
		describe('Top level API endpoint', function(){
			it('Gets current API version', function(done){
				test.httpAgent(app)
					.get('/')
					.expect(200)
					.expect('Content-Type', /json/)
					.end(function(err, res){
						if (err) {
							test.fail(err.message + ' ' + JSON.stringify(res));
						}
						else {
							done();
						}
					});
			});

			it('Can handle unknown routes', function(done){
				test.httpAgent(app)
					.get('/moon')
					.expect(404)
					.expect('Content-Type', /json/)
					.end(function(err, res){
						if (err) {
							test.fail(err.message + ' ' + JSON.stringify(res));
						}
						else {
							done();
						}
					});
			});

		});

		describe('Events endpoint', function() {

			// Shared variables, for transferring data between tests
			let event_id = 0;
			let report_key = 'key';

			// Can get events
			it('Get all events (GET /events)', function(done){
					test.httpAgent(app)
						.get('/events')
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
								done();
							}
					});
			});

			// Can create events, returning new event
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
									"user":"integrated tester"
								}
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
									event_id = res.body.result.objects.output.geometries[0].properties.id;
									report_key = res.body.result.objects.output.geometries[0].properties.report_key;
									done()
							}

						});
				});

			// Can get specified event (tested against just created)
			it('Get the event that was just created (GET /events/:id)', function(done){
				test.httpAgent(app)
					.get('/events/' + event_id)
					.expect(200)
					.expect('Content-Type', /json/)
					.end(function(err, res){
						if (err) {
							test.fail(err.message + ' ' + JSON.stringify(res));
						}
						else {
							// Now http tests passed, we test specific properties of the response against known values
							test.value(res.body.result.objects.output.geometries[0].properties.metadata.user).is('integrated tester');
							test.value(res.body.result.objects.output.geometries[0].properties.report_key).is(report_key);
							done();
						}
				});
			});

			// Can update an event, returning updated event
			it('Create an event (POST /events)', function(done){
					test.httpAgent(app)
						.post('/events/' + event_id)
						.send({
							"status":"inactive",
							"metadata":{
								"updated_by":"integrated tester"
							}
						})
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
									done()
							}
						});
				});

				// Can get get inactive events, including one just updated
				it('Get inactive events (GET /events/?status=inactive)', function(done){
					test.httpAgent(app)
						.get('/events/?status=inactive')
						.expect(200)
						.expect('Content-Type', /json/)
						.end(function(err, res){
							if (err) {
								test.fail(err.message + ' ' + JSON.stringify(res));
							}
							else {
								// Now http tests passed, we test specific properties of the response against known values
								let output = false;
								for (let i = 0; i < res.body.result.objects.output.geometries.length; i++){
									if (res.body.result.objects.output.geometries[i].properties.id === String(event_id)){
										output = true;
									}
								}
								// Updated event is found in output of inactive events
								test.value(output).is(true);
								done();
							}
					});
				});
		// End server test
		return (done())})
	});
});
});
