// Testing for MSF REACH Server
// Unit tests run together against live app, and database
// Data is passed between tests for form integration tests

// Import Unit.js
const test = require('unit.js');

// Import JWT library
const jwt = require('jsonwebtoken');

// Import config
import config from '../config';

// Import DB initializer
import initializeDb from '../db';

// Import the routes
import routes from '../api';

// Import server object
import { init } from '../server.js';

// Mock logger object for app
const winston = require('winston');
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ raw: true }),
  ]
});

// Create JWT against default value in config
const token = jwt.sign({}, new Buffer('public_key'), {algorithm: 'HS256'});
// Create a top-level testing harness
describe('Cognicity Server Testing Harness', function() {

  // Shared variables, for transferring data between tests
  let eventId = 1;
  let reportKey = 'key';
  let report_id = 0;

 it('Server fails if database connection not possible', function(done){
   let config = {};
   init(config, initializeDb, routes, logger)
    .catch((err) => {
      console.log(err);
      done();
    });
 });
 it('Server starts', function(done){
  init(config, initializeDb, routes, logger).then((app) => {
    describe('Top level API endpoint', function(){
      it('Gets current API version', function(done){
        test.httpAgent(app)
          .get('/api')
          .set('Cookie','jwt=' + token)
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
          .get('/api/moon')
          .set('Cookie','jwt=' + token)
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

      // Can get events
      it('Get all events (GET /events)', function(done){
          test.httpAgent(app)
            .get('/api/events')
            .set('Cookie','jwt=' + token)
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

      // Can catch an error with events endpoint if database query fails
      let oldTableEvents = config.TABLE_EVENTS;
      config.TABLE_EVENTS = null;
      it('Catches error with events endpoint if database query fails (GET /events)', function(done){
          test.httpAgent(app)
            .get('/api/events')
            .set('Cookie','jwt=' + token)
            .expect(500)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err === null){
                test.fail('No error returned' + ' ' + JSON.stringify(res));
              }
              else {
                done();
              }
          });
      });
      config.TABLE_EVENTS = oldTableEvents;

      // Can create events, returning new event
      it('Create an event (POST /events)', function(done){
          test.httpAgent(app)
            .post('/api/events')
            .set('Cookie', 'jwt='+token)
            .send({
                "status": "active",
                "type": "natural_hazard",
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
                  eventId = res.body.result.objects.output.geometries[0].properties.id;
                  reportKey = res.body.result.objects.output.geometries[0].properties.reportkey;
                  done();
              }

            });
        });

      // Can get specified event (tested against just created)
      it('Get the event that was just created (GET /events/:id)', function(done){
        test.httpAgent(app)
          .get('/api/events/' + eventId)
          .set('Cookie','jwt=' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res){
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            }
            else {
              // Now http tests passed, we test specific properties of the response against known values
              test.value(res.body.result.objects.output.geometries[0].properties.metadata.user).is('integrated tester');
              test.value(res.body.result.objects.output.geometries[0].properties.reportkey).is(reportKey);
              done();
            }
        });
      });

      // Can update an event, returning updated event
      it('Update an event (PUT /events/:id)', function(done){
          test.httpAgent(app)
            .put('/api/events/' + eventId)
            .set('Cookie', 'jwt='+token)
            .send({
              "status":"inactive",
              "metadata":{
                "updated_by":"integrated tester"
              },
              "location":{
                "lat":45,
                "lng":140
              },
            })
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

        // Can get get inactive events, including one just updated
        it('Get inactive events (GET /events/?status=inactive)', function(done){
          test.httpAgent(app)
            .get('/api/events/?status=inactive')
            .set('Cookie','jwt=' + token)
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
                  if (res.body.result.objects.output.geometries[i].properties.id === String(eventId)){
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
      return (done());
    });

    // Report endpoint
    describe('Reports endpoint', function() {
      // Can create reports, returning a new report
      it('Create a report (POST /reports)', function(done){
          test.httpAgent(app)
            .post('/api/reports')
            // .set('Cookie', 'jwt='+token) this end point not authenticated
            .send({
                "eventId": eventId,
                "status": "confirmed",
                "created": "2017-05-22T20:35Z",
                "reportkey": reportKey,
                "location":{
                  "lat":-6.8,
                  "lng":108.7
                },
                "content":{
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
                report_id = res.body.result.objects.output.geometries[0].properties.id;
                done();
              }
            });
        });

        // Can catch invalid report key at schema level
        it('Catch invalid report key (POST /reports)', function(done){
            test.httpAgent(app)
              .post('/api/reports')
              .set('Cookie', 'jwt='+token)
              .send({
                  "eventId": eventId,
                  "status": "confirmed",
                  "created": "2017-05-22T20:35Z",
                  "reportkey": '123',
                  "location":{
                    "lat":-6.10,
                    "lng":108.7
                  },
                  "content":{
                    "user":"integrated tester"
                  }
              })
              .expect(500)
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

        // Can get specified report (tested against just created)
        it('Get the event that was just created (GET /reports/:id)', function(done){
          test.httpAgent(app)
            .get('/api/reports/' + report_id)
            .set('Cookie','jwt=' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              }
              else {
                // Now http tests passed, we test specific properties of the response against known values
                test.value(res.body.result.objects.output.geometries[0].properties.content.user).is('integrated tester');
                test.value(res.body.result.objects.output.geometries[0].properties.reportkey).is(reportKey);
                done();
              }
          });
        });

        // Can update a report, returning updated event
        it('Update an report (POST /reports)', function(done){
            test.httpAgent(app)
              .post('/api/reports/' + report_id)
              .set('Cookie', 'jwt='+token) // to chagne existing report auth is required
              .send({
                "status":"verified",
                "content":{
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
                  done();
                }
              });
          });

          // Can get reports
          it('Get all reports (GET /reports)', function(done){
              test.httpAgent(app)
                .get('/api/reports')
                .set('Cookie','jwt=' + token)
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

          // Can get reports of a specific event
          it('Get all reports from a specific event (GET /reports?eventId=)', function(done){
              test.httpAgent(app)
                .get('/api/reports?eventId='+eventId)
                .set('Cookie','jwt=' + token)
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
     });
  });
});
});
