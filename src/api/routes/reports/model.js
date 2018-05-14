/*
 * model.js - database models for CogniCity MSF Server reports interaction
 */

// Import promise support
import Promise from 'bluebird';

export default (config, db, logger) => ({

    /**
	 * Return all reports
   * @param {integer} id ID of event to filter reports by
	 */
    all: (eventid) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, event_id as eventId, status, created, report_key as reportkey, content, the_geom
			FROM ${config.TABLE_REPORTS}
			WHERE ($1 is not null and event_id = $1 and not event_id is null) or ($1 is null and event_id is null and status != 'ignored')
			ORDER BY created DESC`; // xor

        let values = [ eventid ];

        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),


    /**
   * Return report specified by ID
   * @param {integer} id ID of event
   */
    byId: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `SELECT id, event_id as eventId, status, created, report_key as reportkey, content, the_geom
      FROM ${config.TABLE_REPORTS}
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
	 * Create a new report
	 * @param {object} body Body of request with report details
	 */
    createReport: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_REPORTS}
			(event_id, status, created, report_key, content, the_geom)
			VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_Point($6,$7),4326))
			RETURNING id, event_id, status, created, report_key, content, the_geom`;

        // Setup values
        let values = [ body.eventId, body.status, body.created, body.reportkey, body.content, body.location.lng, body.location.lat ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, eventId: data.event_id, status:data.status, created: data.created, reportkey:data.report_key, content:data.content, the_geom:data.the_geom }))
            .catch((err) => reject(err));
    }),

    /**
	 * Update a report status
	 * @param {integer} id ID of report
	 * @param {object} body Body of request with event details
	 */
    updateReport: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_REPORTS}
			SET status = $1,
			content = content || $2
			WHERE id = $3
			RETURNING event_id, created, report_key, content, the_geom`;

        // Setup values
        let values = [ body.status, body.content, id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), status: body.status, eventId: data.event_id, created: data.created, reportkey:data.report_key, content:data.content, the_geom:data.the_geom }))
            .catch((err) => reject(err));
    }),

    /**
   * Update a report status
   * @param {integer} report_id ID of report
   * @param {object} event_id ID of event
   */
    linkToEvent: (report_id, event_id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_REPORTS}
      SET event_id=$1,report_key=(SELECT report_key from ${config.TABLE_EVENTS} WHERE id=$1),status='unconfirmed' where id=$2
      RETURNING event_id, report_key`;

        // Setup values
        let values = [ event_id, report_id ];

        // Execute
        logger.debug(query, values);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ report_id: data.report_id, eventId: data.event_id, reportkey:data.report_key}))
            .catch((err) => reject(err));
    })
});
