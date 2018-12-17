// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all eventNotification
   * @param {integer} id ID of event to filter eventNotification by
	 */
    all: (eventId) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id as eventId, category, created, updated, description, username, files
			FROM ${config.TABLE_EVENT_NOTIFICATIONS}
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
    createEventNotification: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_EVENT_NOTIFICATIONS}
			(event_id, category, created, description, username, files)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, event_id, category, created, description, username, files`;

        // Setup values
        let values = [ body.eventId, body.category, body.created, body.description, body.username, body.files];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventId: data.event_id, category:data.category, created: data.created, description:data.description, username:data.username, files:data.files }))
            .catch((err) => reject(err));
    }),

    /**
	 * Update a report status
	 * @param {integer} id ID of report
	 * @param {object} body Body of request with event details
	 */
    updateEventNotification: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENT_NOTIFICATIONS}
			SET category = $1,
			updated = $2,
            description = $3,
            files = $4
			WHERE id = $5
			RETURNING event_id, category, created, updated, description, username, files`;

        // Setup values
        let values = [ body.category, body.updated, body.description, body.files, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), eventId: data.event_id, category:data.category, created: data.created, updated: data.updated, description: data.description, username:data.username, files:data.files}))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE an eventNotification from the database
    * @param {integer} id ID of contact
    */
    deleteEventNotification: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `DELETE FROM ${config.TABLE_EVENT_NOTIFICATIONS} WHERE id = $1`;

        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
