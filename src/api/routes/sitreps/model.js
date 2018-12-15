// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all eventNotification
   * @param {integer} id ID of event to filter eventNotification by
	 */
    all: (eventid) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id as eventId, created_at as createdAt, updated_at as updatedAt, description, username, files
			FROM ${config.TABLE_SITREP}
			WHERE event_id = $1
			ORDER BY created_at DESC`; // xor

        let values = [ eventid ];

        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),
    /**
	 * Create a new report
	 * @param {object} body Body of request with report details
	 */
    createSitRep: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_SITREP}
			(event_id, created_at, description, username, files)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, event_id, created_at, description, username, files`;

        // Setup values
        let values = [ body.eventId, body.createdAt, body.description, body.username, body.files];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventId: data.event_id, createdAt: data.created_at, description: data.description, username:data.username, files:data.files }))
            .catch((err) => reject(err));
    }),

    /**
	 * Update a report status
	 * @param {integer} id ID of report
	 * @param {object} body Body of request with event details
	 */
    updateSitRep: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_SITREP}
			SET updated_at = $1,
            description = description || $2
            files = files || $3
			WHERE id = $4
			RETURNING event_id, created_at, updated_at, description, username, files`;

        // Setup values
        let values = [body.updatedAt, body.description, body.files, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), eventId: data.event_id, createdAt: data.created_at, updatedAt: data.updated_at, description: data.description, username:data.username, files:data.files}))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE an eventNotification from the database
    * @param {integer} id ID of contact
    */
    deleteSitRep: (id) => new Promise((resolve, reject) => {
        let query = `DELETE FROM ${config.TABLE_SITREP} WHERE id = $1`;
        let values = [ id ];
        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
