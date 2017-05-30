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

// Function to start the initialize the api server config, db, logger
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

			// Mount the routes
			app.use('/', routes({ config, db, logger }));

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
