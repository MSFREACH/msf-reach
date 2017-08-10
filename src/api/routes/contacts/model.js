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

    let query = `SELECT array_to_json(array_agg(row_to_json(m.*))) as contacts FROM (SELECT id, properties FROM ${config.TABLE_CONTACTS} ORDER BY id) m`

		// Execute
		db.any(query).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	})
});
