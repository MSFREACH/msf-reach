import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all events
	 */
	all: () => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT id, status, type, created, metadata, the_geom
			FROM ${config.TABLE_EVENTS}
			ORDER BY created DESC`;

		// Execute
		logger.debug(query);
		db.any(query).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),


  /**
   * Return event specified by ID
   * @param {integer} id ID of event
   */
	byId: (id) => new Promise((resolve, reject) => {

		// Setup query
    let query = `SELECT id, status, type, created, metadata, the_geom
      FROM ${config.TABLE_EVENTS}
      WHERE id = $1
      ORDER BY created DESC`;

		// Setup values
		let values = [ id ];

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	})

});
