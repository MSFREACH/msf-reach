import Promise from 'bluebird';

// Import express, fs and http
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';

// Import express middlewares
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import responseTime from 'response-time';

// Import config
import config from './config';

// Import DB initializer
import initializeDb from './db';

// Import the routes
import routes from './api';

// Import logging libraries
import morgan from 'morgan'; // Express logging
import logger from 'winston'; // Application logging

// Set the default logging level
logger.level = config.LOG_LEVEL;

// Check that log file directory can be written to
try {
	config.LOG_DIR !== '' && fs.accessSync(config.LOG_DIR, fs.W_OK);
	logger.info(`Logging to ${config.LOG_DIR !== '' ? config.LOG_DIR : 'current working directory' }`);
} catch(e) {
	// If we cannot write to the desired directory then log in the current directory
	logger.info(`Cannot log to '${config.LOG_DIR}', logging to current working directory instead`);
	config.LOG_DIR = '';
}

// Configure the logger
logger.add(logger.transports.File, {
	filename: path.join(config.LOG_DIR, `${config.APP_NAME}.log`),
	json: config.LOG_JSON, // Log in json or plain text
	maxsize: config.LOG_MAX_FILE_SIZE, // Max size of each file
	maxFiles: config.LOG_MAX_FILES, // Max number of files
	level: config.LOG_LEVEL // Level of log messages
})

// If we are not in development and console logging has not been requested then remove it
if (config.NODE_ENV !== 'development' && !config.LOG_CONSOLE) {
	logger.remove(logger.transports.Console);
}

// Function to start the initialize the api server
const init = () => new Promise((resolve, reject) => {

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

// If we exit immediately winston does not get a chance to write the last log message
const exitWithStatus = (status) => {
	logger.info(`Exiting with status ${status}`);
	setTimeout(() => process.exit(status), 500);
}

// Catch kill and interrupt signals and log a clean exit status
process
	.on('SIGTERM', () => {
		logger.info('SIGTERM: Application shutting down');
		exitWithStatus(0);
	})
	.on('SIGINT', () => {
		logger.info('SIGINT: Application shutting down');
		exitWithStatus(0);
	});

// Try and start the server
init().then((app) => {
	// All good to go, start listening for requests
	app.server.listen(config.PORT);
	logger.info(`Application started, listening on port ${app.server.address().port}`);
}).catch((err) => {
	// Error has occurred, log and shutdown
	logger.error('Error starting server: ' + err.message + ', ' + err.stack);
	logger.error('Fatal error: Application shutting down');
	exitWithStatus(1);
});

// Export the init function for use externally (e.g. in tests)
module.exports = { init };
