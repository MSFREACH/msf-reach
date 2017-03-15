import Promise from 'bluebird';

// Import DB library
const pgp = require('pg-promise')({
  // Initialization Options
  promiseLib: Promise // Use bluebird for enhanced Promises
}) ;

export default (config, logger) => new Promise((resolve, reject) => {

	// Build the connection string
	const cn = `postgres://${config.PGUSER}:${config.PGPASSWORD}@${config.PGHOST}:${config.PGPORT}/${config.PGDATABASE}?ssl=${config.PGSSL}`;
  logger.debug(cn);

	// Setup the connection
	let db = pgp(cn);

	// Make sure we can connect, if so resolve, if not reject
	db.proc('version').timeout(config.PGTIMEOUT)
		.then(() => resolve(db))
		.catch((err) => {
			logger.error(err);
			reject(err);
		});

});
