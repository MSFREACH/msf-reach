// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all eventNotification
   * @param {integer} id ID of event to filter eventNotification by
	 */
    all: (eventid) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id as eventId, category, created_at as createdAt, updated_at as updatedAt, descrption, username, files
			FROM ${config.TABLE_EVENT_NOTIFICATIONS}
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
    createEventNotification: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_EVENT_NOTIFICATIONS}
			(event_id, category, created_at, description, username, files)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, event_id, category, created_at, description, username, files`;

        // Setup values
        let values = [ body.eventId, body.category, body.createdAt, body.description, body.username, body.files];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventId: data.event_id, category:data.category, createdAt: data.created_at, description:data.description, username:data.username, files:data.files }))
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
			SET category = category || $1,
			updated_at = $2,
            description = description || $3
            files = files || $4
			WHERE id = $5
			RETURNING event_id, category, created_at, updated_at, description, username, files`;

        // Setup values
        let values = [ body.category, body.updatedAt, body.description, body.files, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), eventId: data.event_id, category:data.category, createdAt: data.created_at, updatedAt: data.updated_at, description: data.description, username:data.username, files:data.files}))
            .catch((err) => reject(err));
    })

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
            .then((data) => resolve())
            .catch((err) => reject(err));
    })

});
