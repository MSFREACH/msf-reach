/*
 * model.js - database models for CogniCity MSF Server missions data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all events
	 */
	all: (search) => new Promise((resolve, reject) => {
		// Setup query

		let query = `SELECT id, properties, the_geom
			FROM ${config.TABLE_MISSIONS}
			WHERE ($1 IS NULL OR (
				properties ->> 'capacity' LIKE $1
				OR properties ->> 'name' LIKE $1
				OR properties ->> 'region' LIKE $1
				OR properties ->> 'severity' LIKE $1))
			ORDER BY id`;

		// Format search string for Postgres
		let text = !search ? null : "%" + search + "%";
		let values = [text];

		// Execute
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),

  /**
   * Return mission specified by ID
   * @param {integer} id ID of mission
   */
  byId: id =>
    new Promise((resolve, reject) => {
      // Setup query
      let query = `SELECT id, properties, the_geom
        FROM ${config.TABLE_MISSIONS}
        WHERE id = $1`;

      // Setup value{s}
      let values = [id];

      // Execute
      logger.debug(query, values);
      db.oneOrNone(query, values)
        .timeout(config.PGTIMEOUT)
        .then(data => resolve(data))
        .catch(err => reject(err));
    })
});
