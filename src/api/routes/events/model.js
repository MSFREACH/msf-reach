/*
 * model.js - database models for CogniCity MSF Server events interaction
 */

// Import promise support
import Promise from 'bluebird';

import request from 'request';

import { addChatbotItem } from '../../../lib/chatbot.js';

export default (config, db, logger) => ({

    /**
	 * Return all events, optionally matching filters
	 * @param {String} status of event { active | inactive }
     * @param {String} country filter for event
     * @param {Object} location nearby centroid
     * @param {Number} location.lng longitude
     * @param {Number} location.lat latitude
	 */
    all: (status, country, location) => new Promise((resolve, reject) => {
        // Construct geom, if exists
        const geom = !!location.lng &&
        !!location.lat && 'POINT(' + location.lng +' '+location.lat +')' || null;
        // Setup query
        let query = `SELECT id, status, type, created_at, updated_at, report_key as reportkey, metadata, the_geom
			FROM ${config.TABLE_EVENTS}
            WHERE ($1 is null or status = $1) AND
                ($2 is null or metadata->>'country' = $2) AND
                ($3 is null or ST_DWITHIN(ST_TRANSFORM(the_geom,3857),ST_TRANSFORM(ST_GEOMFROMTEXT($3,4326),3857),${config.DEFAULT_EVENT_SEARCH_DISTANCE}))
			ORDER BY updated_at DESC`;
        let values = [ status, country, geom ];
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
        let queryOne = `INSERT INTO ${config.TABLE_EVENTS}
			(status, type, created_at, updated_at, metadata, the_geom)
			VALUES ($1, $2, $3, now(), $4, ST_SetSRID(ST_Point($5,$6),4326))
			RETURNING id, report_key, the_geom`;
        let queryTwo = `UPDATE ${config.TABLE_REPORTS}
      SET event_id=$1,report_key=(SELECT report_key from ${config.TABLE_EVENTS} WHERE id=$1),status='unconfirmed' where id=$2
      RETURNING event_id, report_key`;

        // Setup values
        let values = [ body.status, body.type, body.created_at, body.metadata, body.location.lng, body.location.lat];

        // Execute
        logger.debug(queryOne, queryTwo, values);

        if (config.GOOGLE_API_KEY) {
            request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+String(body.location.lat)+','+String(body.location.lng)+'&key='+config.GOOGLE_API_KEY, function (error, response, response_body) {
                body.metadata.country = 'unknown';
                if (error) {
                    logger.error('err ' + error );
                    logger.error('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    body.metadata.country = 'unknown';
                    body.metadata.areas = [];
                } else {
                    body.metadata.country = 'unknown';
                    let geocoded = JSON.parse(response_body);
                    body.metadata.areas = [];
                    if (geocoded && geocoded.results && geocoded.results[0] && geocoded.results[0].address_components) {
                        var address = geocoded.results[0].address_components;
                        var area = {
                            region: '',
                            country: '',
                            country_code: ''
                        };
                        for (let i = 0; i < address.length; i++ ) {
                            if (address[i].types.indexOf('administrative_area_level_1') > -1) {
                                area.region=address[i].long_name;
                            }
                            if (address[i].types.indexOf('country') > -1) {
                                area.country=address[i].long_name;
                                area.country_code=address[i].short_name;
                            }
                        }
                        body.metadata.areas.push(area);
                    }
                }
                db.task(async t => { //eslint-disable-line no-unused-vars
                    let data = await db.oneOrNone(queryOne, values);
                    if (body.hasOwnProperty('report_id')) {
                        await db.one(queryTwo, [data.id, body.report_id]);
                    }
                    return await addChatbotItem(data,String(data.id),body,config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key,logger);
                }).then((data) => addChatbotItem(data,String(data.id),body,config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key,logger))
                    .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                    .catch((err) => reject(err));

            });

        } else {

            db.task(async t => { //eslint-disable-line no-unused-vars
                let data = await db.oneOrNone(queryOne, values);
                if (body.hasOwnProperty('report_id')) {
                    await db.one(queryTwo, [data.id, body.report_id]);
                }
                return data;
            }).then((data) => addChatbotItem(data,String(data.id),body,config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key,logger))
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
            type = $4,
			metadata = metadata || $2
			WHERE id = $3
			RETURNING type, created_at, updated_at, report_key, metadata, ST_X(the_geom) as lng, ST_Y(the_geom) as lat`;

        // Setup values
        let values = [ body.status, body.metadata, id, body.type ];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => addChatbotItem(data,String(id),body,config.BASE_URL+'report/?eventId='+String(id)+'&report='+data.report_key,logger))
            .then((data) => resolve({ id: String(id), status: body.status, type:data.type, created: data.created, reportkey:data.report_key, metadata:data.metadata, lat: data.lat, lng: data.lng }))
            .catch((err) => reject(err));
    }),

    /**
   * Update an event location
   * @param {integer} id ID of event
   * @param {object} body Body of request with event location update
   */
    updateLocation: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
        			SET the_geom = ST_SetSRID(ST_Point($1,$2),4326),
              updated_at = now(),
        			metadata = metadata || $3
        			WHERE id = $4
        			RETURNING type, created_at, updated_at, report_key, metadata, the_geom`;


        // Execute
        logger.debug(query);

        if (config.GOOGLE_API_KEY) {
            request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+String(body.location.lat)+','+String(body.location.lng)+'&key='+config.GOOGLE_API_KEY, function (error, response, response_body) {
                let country = 'unknown';
                if (error) {
                    logger.error('err ' + error );
                    logger.error('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                    country = 'unknown';
                } else {
                    country = 'unknown';
                    let geocoded = JSON.parse(response_body);
                    if (geocoded && geocoded.results && geocoded.results[0] && geocoded.results[0].address_components) {
                        for (let i = 0; i < geocoded.results[0].address_components.length; i++ ) {
                            if (geocoded.results[0].address_components[i].types.indexOf('country') > -1) {
                                country=geocoded.results[0].address_components[i].long_name;
                            }
                        }
                    }
                }
                // Setup values
                let values = [ body.location.lng, body.location.lat, {'country':country}, id ];

                db.one(query, values).timeout(config.PGTIMEOUT).then((data) => addChatbotItem(data,String(data.id),body,config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key,logger))
                    .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                    .catch((err) => reject(err));


            });
        } else {

            // Setup values
            let values = [ body.location.lng, body.location.lat, {'country':'unknown'}, id ];

            db.one(query, values).timeout(config.PGTIMEOUT).then((data) => addChatbotItem(data,String(data.id),body,config.BASE_URL+'report/?eventId='+data.id+'&report='+data.report_key,logger))
                .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                .catch((err) => reject(err));

        }

    })
});
