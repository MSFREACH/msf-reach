// Import Unit.js
const test = require('unit.js');

import initializeDb from '../db';

describe('Test CogniCity Server Database Module', function() {
 it('Catches errors on startup', function(done){
   // Try and connect to the db
   let config = {};
   let logger = {};
   logger.error =function(err){
     console.log(err);
   }
   logger.debug =function(err){
     console.log(err);
   }
   initializeDb(config, logger)
    .then((db) => {
      //done(); do nothing here, an error should be forced by empty config
    })
    .catch((err) => {
      done();
    });
 });
});
