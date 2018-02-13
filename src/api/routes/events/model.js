/*
 * model.js - database models for CogniCity MSF Server events interaction
 */

// Import promise support
import Promise from 'bluebird';

import request from 'request';

import { addChatbotItem } from '../../../lib/chatbot.js';

export default (config, db, logger) => ({

    /**
	 * Return all events
	 * @param {String} Status of event { active | inactive }

	 */
    all: (status) => new Promise((resolve, reject) => {
        // Setup query
        let query = `SELECT id, status, type, created_at, updated_at, report_key as reportkey, metadata, the_geom
			FROM ${config.TABLE_EVENTS}
			WHERE ($1 is null or status = $1)
			ORDER BY updated_at DESC`;

        let values = [ status ];

        // Execute
        db.any(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),


    /**
   * Return event specified by ID
   * @param {integer} id ID of event
   */
    byId: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query = `SELECT id, status, type, created_at, updated_at, report_key as reportkey, metadata, the_geom
      FROM ${config.TABLE_EVENTS}
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
	 * Create a new event
	 * @param {object} body Body of request with event details
	 */
    createEvent: (body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_EVENTS}
			(status, type, created_at, updated_at, metadata, the_geom)
			VALUES ($1, $2, $3, now(), $4, ST_SetSRID(ST_Point($5,$6),4326))
			RETURNING id, report_key, the_geom`;

        // Setup values
        let values = [ body.status, body.type, body.created_at, body.metadata, body.location.lng, body.location.lat ];

        // Execute
        logger.debug(query, values);

        if (config.GOOGLE_API_KEY) {
            request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+String(body.location.lat)+','+String(body.location.lng)+'&key='+config.GOOGLE_API_KEY, function (error, response, response_body) {
                body.metadata.country = 'unknown';
                if (error) {
                    logger.error('err ' + error );
                    logger.error('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    body.metadata.country = 'unknown';
                } else {
                    body.metadata.country = 'unknown';
                    let geocoded = JSON.parse(response_body);
                    if (geocoded && geocoded.results && geocoded.results[0] && geocoded.results[0].address_components) {
                        for (let i = 0; i < geocoded.results[0].address_components.length; i++ ) {
                            if (geocoded.results[0].address_components[i].types.indexOf('country') > -1) {
                                body.metadata.country=geocoded.results[0].address_components[i].long_name;
                            }
                        }
                    }
                }
                db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
                    .then((data) => addChatbotItem(data,data.id,body.metadata.name.split('_'),config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key))
                    .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                    .catch((err) => reject(err));

            });

        } else {

            db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
                .then((data) => addChatbotItem(data,data.id,body.metadata.name.split('_'),config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key))
                .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                .catch((err) => reject(err));
        }
    }),

    /**
	 * Update an event status
	 * @param {integer} id ID of event
	 * @param {object} body Body of request with event details
	 */
    updateEvent: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
			SET status = $1,
      updated_at = now(),
			metadata = metadata || $2
			WHERE id = $3
			RETURNING type, created_at, updated_at, report_key, metadata, the_geom`;

        // Setup values
        let values = [ body.status, body.metadata, id ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => {
                if (typeof(body.metadata.name)!=='undefined') {
                    addChatbotItem(data,String(id),body.metadata.name.split('_'),config.BASE_URL+'report/?eventId='+String(id)+'&report='+data.report_key);
                }
            })
            .then((data) => resolve({ id: String(id), status: body.status, type:data.type, created: data.created, reportkey:data.report_key, metadata:data.metadata, uuid: data.uuid, the_geom:data.the_geom }))
            .catch((err) => reject(err));
    })
});
