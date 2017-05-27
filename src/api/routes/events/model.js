import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return all events
	 */
	all: () => new Promise((resolve, reject) => {

		// Setup query
		let query = `SELECT id, status, type, created, metadata, uuid, the_geom
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
    let query = `SELECT id, status, type, created, metadata, uuid, the_geom
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
	}),

	/**
	 * Add a new event
	 * @param {object} body Body of request with event details
	 */
	addEvent: (body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `INSERT INTO ${config.TABLE_EVENTS}
			(status, type, created, metadata, the_geom)
			VALUES ($1, $2, $3, $4, ST_SetSRID(ST_Point($5,$6),4326))
			RETURNING id, uuid, the_geom`;

			// Setup values
		let values = [ body.status, body.type, body.created, body.metadata, body.location.lng, body.location.lat ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve({ id: data.id, status: body.status, type:body.type, created: body.created, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
			.catch((err) => reject(err));
	})

});
