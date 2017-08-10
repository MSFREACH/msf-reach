/*
 * model.js - database models for CogniCity MSF Server missions data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all events
	 */
	all: () => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT id, properties, type, created, report_key as reportkey, metadata, uuid, the_geom
			FROM ${config.TABLE_EVENTS}
			WHERE ($1 is null or status = $1)
			ORDER BY created DESC`;

    let query = `SELECT array_to_json(array_agg(row_to_json(m.*))) FROM (SELECT id, properties FROM ${config.TABLE_MISSIONS}) m`

		// Execute
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	})
});
