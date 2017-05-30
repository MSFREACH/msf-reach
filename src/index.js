// Import express, fs and http
import fs from 'fs';
import path from 'path';

// Import config
import config from './config';

// Import DB initializer
import initializeDb from './db';

// Import the routes
import routes from './api';

// Import server
import { init } from './server.js';

// Import logging libraries
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
init(config, initializeDb, routes, logger).then((app) => {
	// All good to go, start listening for requests
	app.server.listen(config.PORT);
	logger.info(`Application started, listening on port ${app.server.address().port}`);
}).catch((err) => {
	// Error has occurred, log and shutdown
	logger.error('Error starting server: ' + err.message + ', ' + err.stack);
	logger.error('Fatal error: Application shutting down');
	exitWithStatus(1);
});
