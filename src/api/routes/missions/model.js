/*
* model.js - database models for CogniCity MSF Server missions data
*/

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	* Return all missions
  * @function all
  * @param {string} search - optional search string
  * @param {Object} bounds - optional bounding box coordinates (xmin,  ymin, xmax, ymax)
  * @param {string} country - optional to limit by country
	*/
    all: (search,bounds,country) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, properties, the_geom, event_id
		FROM ${config.TABLE_MISSIONS}
		WHERE ($1 IS NULL OR (
			properties ->> 'name' ILIKE $1
			OR properties ->> 'cell' ILIKE $1
			OR properties ->> 'email' ILIKE $1)) AND
			($2 IS NULL OR ( the_geom && ST_MakeEnvelope($3,$4,$5,$6, 4326) ) ) AND
            ($7 IS NULL OR properties->>'country' = $7)
			ORDER BY id`;

        // Format search string for Postgres
        let text = (!search) ? null : '%'+search+'%';
        let hasBounds= (bounds.xmin && bounds.ymin && bounds.xmax && bounds.ymax);
        let values = [ text, hasBounds, bounds.xmin,bounds.ymin,bounds.xmax, bounds.ymax, country ];

        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    /**
		* Return historical mission specified by ID
    * @function byId
		* @param {integer} id ID of mission
		*/
    byId: id =>
        new Promise((resolve, reject) => {
            // Setup query
            let query = `SELECT id, properties, the_geom, event_id
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
        }),

    /**
    		* Create a historical mission entry
        * @function createMission
    		* @param {Object} body - all the details
    		*/
    createMission: (body,event_id) => new Promise((resolve, reject) => {
        // Setup query
        let query = `INSERT INTO ${config.TABLE_MISSIONS}
                    (properties, the_geom, event_id)
                    VALUES ($1, ST_SetSRID(ST_Point($2,$3),4326),$4)
                    RETURNING id, properties, the_geom, event_id`;

        // Setup values
        let values = [body.metadata, body.location.lng, body.location.lat, event_id || null];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, metadata: body.metadata, the_geom: data.the_geom }))
            .catch((err) => reject(err));
    }),
    /**
   * Update a mission
   * @param {integer} id ID of event
   * @param {object} body Body of request with event details
   */
    updateMission: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_MISSIONS}
      SET properties = properties || $1,
          the_geom =   ST_SetSRID(ST_Point($2,$3),4326)
      WHERE id = $4
      RETURNING id, properties, the_geom`;

        // Setup values
        let values = [ body.metadata,  body.location.lng, body.location.lat, id];

        // Execute
        logger.debug(query, values);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(data.id),  properties:data.properties, the_geom:data.the_geom }))
            .catch((err) => reject(err));
    }),
    /**
    * DELETE a mission from the database
    * @param {integer} id ID of mission
    */
    deleteMission: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `DELETE FROM ${config.TABLE_MISSIONS} WHERE id = $1`;

        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then(() => resolve())
            .catch((err) => reject(err));
    })
});
