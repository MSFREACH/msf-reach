/*
* model.js - database models for CogniCity MSF Server missions data
*/

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

	/**
	* Return all events
	*/
	all: (search,bounds) => new Promise((resolve, reject) => {
		// Setup query
		let query = `SELECT id, properties, the_geom
		FROM ${config.TABLE_MISSIONS}
		WHERE ($1 IS NULL OR (
			properties ->> 'name' ILIKE $1
			OR properties ->> 'cell' ILIKE $1
			OR properties ->> 'email' ILIKE $1)) AND
			($2 IS NULL OR ( the_geom && ST_MakeEnvelope($3,$4,$5,$6, 4326) ) )
			ORDER BY id`;

			// Format search string for Postgres
			let text = (!search) ? null : '%'+search+'%'	;
			let hasBounds= (bounds.xmin && bounds.ymin && bounds.xmax && bounds.ymax)
			let values = [ text, hasBounds, bounds.xmin,bounds.ymin,bounds.xmax, bounds.ymax ];

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
