import Promise from 'bluebird';

// Express middleware and http
import express from 'express';
import http from 'http';

// Import express middlewares
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import responseTime from 'response-time';
import morgan from 'morgan'; // Express logging

import { jwtCheck } from './lib/util';


/** Function to initialize the api server config, db, logger
	* @class - Initialize server
	* @param {Object} config - server config
	* @param {Object} initializeDb - database initialization object
	* @param {Object} routes - API router object
	* @param {Object} logger - server logging object
	**/
const init = (config, initializeDb, routes, logger) => new Promise((resolve, reject) => {

	// Create the server
	let app = express();
	app.server = http.createServer(app);

	// Winston stream function we can plug in to express so we can capture its logs along with our own
	const winstonStream = {
		write: function(message) {
			logger.info(message.slice(0, -1));
		}
	};

	// Setup express logger
	app.use(morgan('combined', { stream : winstonStream }));

	// Compress responses if required but only if caching is disabled
	config.COMPRESS && !config.CACHE && app.use(compression());

	// Provide CORS support (not required if behind API gateway)
	config.CORS && app.use(cors({ exposedHeaders: config.CORS_HEADERS }));

	// Provide response time header in response
	config.RESPONSE_TIME && app.use(responseTime());

	// Parse body messages into json
	app.use(bodyParser.json({ limit : config.BODY_LIMIT }));

	// Try and connect to the db
	initializeDb(config, logger)
		.then((db) => {
			// Log debug message
			logger.debug('Successfully connected to DB');
			//app.use(cookieParser()); // Enable cookies
			// Mount the routes
			app.use('/login', express.static(config.STATIC_AUTH_PATH));
			app.use('/report', express.static(config.STATIC_REPORT_PATH))
			app.use('/lib', express.static(config.STATIC_LIB_PATH)); // Allow resources to be shared with un-authed path
			app.use('/resources', express.static(config.STATIC_RESOURCES_PATH)); // Allow resources to be shared with un-authed path


			// Mount the API. authentication specified within routes
			app.use('/api', routes({ config, db, logger }));


			// Set jetCheck on root. All paths below this will also have JWT checks applied.
			app.use('/', [jwtCheck, express.static(config.STATIC_PATH)], function(err, req, res, next){
				if (err.name === 'UnauthorizedError'){
					res.redirect('/login');
				}
			});

			// App is ready to go, resolve the promise
			resolve(app);

		})
		.catch((err) => {
			logger.error('DB Connection error: ' + err);
			logger.error('Fatal error: Application shutting down');

			// We cannot continue without a DB, reject
			reject(err);
		})
})

// Export the init function for use externally (e.g. in tests)
module.exports = { init };
