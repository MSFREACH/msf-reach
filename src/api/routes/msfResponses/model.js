/*
 * model.js - database models for CogniCity MSF Server responses interaction
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    all: (eventId) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id, event_status, project_code, operational_center, metadata, programmes, the_geom
			FROM ${config.TABLE_MSF_RESPONSES}
            WHERE event_id = $1`;
        let values = [ eventId ];
        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    /**
   * Return Response specified by ID
   * @param {integer} id ID of Response
   */
    byId: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `SELECT id, event_id, event_status, project_code, operational_center, metadata, programmes, the_geom
      FROM ${config.TABLE_MSF_RESPONSES}
      WHERE id = $1
      ORDER BY created_at DESC`;

        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    /**
	 * Create a new Response
	 * @param {object} body Body of request with Response details
	 */
    createResponse: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_MSF_RESPONSES}
            (event_id, event_status, project_code, operational_center, metadata, programmes, the_geom)
			VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_GeomFromGeoJSON($7), 4326))
            RETURNING id, event_id, event_status, project_code, operational_center, metadata, programmes, the_geom`;
        // Setup values
        let values = [parseInt(body.event_id), body.event_status, body.project_code, body.operational_center, body.metadata, body.programmes, body.area];
        // Execute
        logger.debug(query, values);

        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventStatus: data.eventStatus, project_code: data.project_code, metadata: data.metadata, programmes: data.programmes, the_geom: data.the_geom}))
            .catch((err) => reject(err));
    }),

    /**
	 * Update an Response status
	 * @param {integer} id ID of Response
	 * @param {object} body Body of request with Response details
	 */
    updateResponse: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_MSF_RESPONSES}
			SET project_code = project_code || $1,
            operational_center = operational_center || $2,
			metadata = metadata || $3,
            programmes = programmes || $4
			WHERE id = $5
			RETURNING id, event_id, event_status, project_code, operational_center, metadata, programmes, ST_X(the_geom) as lng, ST_Y(the_geom) as lat`;

        // Setup values
        let values = [body.project_code, body.operational_center, body.metadata, body.programmes, id];

        // Execute
        logger.debug(query);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), event_status: data.event_status, project_code: data.project_code, metadata:data.metadata, programmes: data.programmes, lat: data.lat, lng: data.lng}))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE a response from the database
    * @param {integer} id ID of Response
    */
    deleteResponse: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `DELETE FROM ${config.TABLE_MSF_RESPONSES} WHERE id = $1`;

        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query, values);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })
});
