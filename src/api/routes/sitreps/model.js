// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all eventNotification
   * @param {integer} id ID of event to filter eventNotification by
	 */
    all: (eventId) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id as eventId, created, updated, description, username, files
			FROM ${config.TABLE_SITREPS}
			WHERE event_id = $1
			ORDER BY created DESC`; // xor

        let values = [ eventId ];
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
        let query = `INSERT INTO ${config.TABLE_SITREPS}
			(event_id, created, description, username, files)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, event_id, created, description, username, files`;

        // Setup values
        let values = [ body.eventId, body.created, body.description, body.username, body.files];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventId: data.event_id, created: data.created, description: data.description, username:data.username, files:data.files }))
            .catch((err) => reject(err));
    }),

    /**
	 * Update a report status
	 * @param {integer} id ID of report
	 * @param {object} body Body of request with event details
	 */
    updateSitRep: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_SITREPS}
			SET updated = $1,
            description = description || $2,
            username = username || $3,
            files = files || $4
			WHERE id = $5
			RETURNING event_id, created, updated, description, username, files`;

        // Setup values
        let values = [body.updated, body.description, body.username, body.files, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), eventId: data.event_id, created: data.created, updated: data.updated, description: data.description, username:data.username, files:data.files}))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE an eventNotification from the database
    * @param {integer} id ID of contact
    */
    deleteSitRep: (id) => new Promise((resolve, reject) => {
        let query = `DELETE FROM ${config.TABLE_SITREPS} WHERE id = $1`;
        let values = [ id ];
        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
