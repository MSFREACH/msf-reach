/*
 * model.js - database models for CogniCity MSF Server missions data
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	 * Return contacts
	 * @function all - returns contacts, optionally filtered by string
	 * @param {String} search - optional string search against name, email, cell
	 */
	all: (search) => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT properties, the_geom
			FROM ${config.TABLE_CONTACTS}
			WHERE ($1 IS NULL OR (
				properties ->> 'name' LIKE $1
				OR properties ->> 'cell' LIKE $1
				OR properties ->> 'email' LIKE $1))
			ORDER BY id`;

		// Format search string for Postgres
		let text = '%'+search+'%'	;
		let values = [ text ];

		// Execute
		db.any(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve(data))
			.catch((err) => reject(err));
	}),

	/**
	 * Create a new contact
	 * @param {object} body Body of request with contact details
	 */
	createContact: (body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `INSERT INTO ${config.TABLE_CONTACTS}
			(properties, the_geom)
			VALUES ($1, ST_SetSRID(ST_Point($2,$3),4326))
			RETURNING id, properties, the_geom`;

			// Setup values
		let values = [ body.properties, body.location.lng, body.location.lat ]

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve({ id: data.id, properties:data.properties, the_geom:data.the_geom }))
			.catch((err) => reject(err));
	}),

	/**
	 * Update a contact
	 * @param {integer} id ID of contact
	 * @param {object} body Body of request with contact details
	 */
	updateContact: (id, body) => new Promise((resolve, reject) => {

		// Setup query
		let query = `UPDATE ${config.TABLE_CONTACTS}
			SET properties = properties || $1
			WHERE id = $2
			RETURNING  properties, the_geom`;

		// Setup values
		let values = [ body.properties, id ];

		// Execute
		logger.debug(query, values);
		db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
			.then((data) => resolve({ id: String(id), properties:data.properties, the_geom:data.the_geom }))
			.catch((err) => reject(err));
	})


});
