/*
 * model.js - database models for CogniCity MSF Server events interaction
 */

// Import promise support
import Promise from 'bluebird';

import request from 'request';

import mail from '../../../lib/mailer';

export default (config, db, logger) => ({

    /**
	 * Return all events, optionally matching filters
	 * @param {String} status of event { active | inactive }
     * @param {String} country filter for event
     * @param {Object} location nearby centroid
     * @param {Number} location.lng longitude
     * @param {Number} location.lat latitude
	 */
    all: (status, country, location, types, search) => new Promise((resolve, reject) => {
        // Construct geom, if exists
        const geom = !!location.lng &&
        !!location.lat && 'POINT(' + location.lng +' '+location.lat +')' || null;
        // Setup query
        let query = `SELECT id, status, type, created_at, updated_at, report_key as reportkey, metadata, ext_capacity as extCapacity, figures, resources, the_geom
			FROM ${config.TABLE_EVENTS}
            WHERE ($1 is null or status = $1) AND
                ($4 is null or
                    (metadata->>'name' ilike $4 or
                    metadata->>'description' ilike $4 or
                    type ilike $4 or
                    metadata->>'type' ilike $4 or
                    metadata->>'sub_type' ilike $4)) AND
                ($5 is null or (type = ANY($5::VARCHAR[])  or
                metadata->>'type' = ANY($5::VARCHAR[])  or
                metadata->>'sub_type' = ANY($5::VARCHAR[]) )) AND
                ($2 is null or metadata->>'country' = $2) AND
                ($3 is null or ST_DWITHIN(ST_TRANSFORM(the_geom,3857),ST_TRANSFORM(ST_GEOMFROMTEXT($3,4326),3857),${config.DEFAULT_EVENT_SEARCH_DISTANCE}))
            ORDER BY updated_at DESC`;
        let values = [ status, country, geom, (search ? '%'+search+'%' : null), types];
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
        let query = `SELECT id, status, type, created_at, updated_at, report_key as reportkey, metadata, ext_capacity as extCapacity, figures, resources, the_geom
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
   * @param {string} email Email address to subscribe
	 */
    createEvent: (body,subscribtionEmail) => new Promise((resolve, reject) => {

        // Setup query
        let query = `INSERT INTO ${config.TABLE_EVENTS}
			(status, type, created_at, updated_at, metadata, the_geom, subscribers)
			VALUES ($1, $2, $3, now(), $4, ST_SetSRID(ST_Point($5,$6),4326), $7)
			RETURNING id, report_key, the_geom`;

        // Setup values
        let values = [ body.status, body.type, body.created_at, body.metadata, body.location.lng, body.location.lat, [subscribtionEmail || ''] ];

        // Execute
        logger.debug(query, values);

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

                                body.metadata.country=address[i].long_name;
                            }
                        }
                        body.metadata.areas.push(area);
                    }
                }
                db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
                    .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                    .catch((err) => reject(err));

            });

        } else {

            db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
                .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                .catch((err) => reject(err));
        }
    }),

    /**
	 * Update an event status
	 * @param {integer} id ID of event
	 * @param {object} body Body of request with event details
   * @param {object} email email address to subscribe
	 */
    updateEvent: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
			SET status = $1,
            updated_at = now(),
            type = $4,
			metadata = metadata || $2
			WHERE id = $3
			RETURNING subscribers, type, created_at, updated_at, report_key, metadata, ST_X(the_geom) as lng, ST_Y(the_geom) as lat`;

        // Setup values
        let values = [ body.status, body.metadata, id, body.type ];

        // Execute
        logger.debug(query);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            //.then((data) => mail(config,logger).emailSubscribers(data,id))
            .then((data) => resolve({ id: String(id), status: body.status, type:data.type, created: data.created, reportkey:data.report_key, metadata:data.metadata, lat: data.lat, lng: data.lng }))
            .catch((err) => reject(err));
    }),

    updateEventExtCapacity: (id, body) => new Promise((resolve, reject) => {
        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
            SET updated_at = now(),
            ext_capacity = $1::jsonb
            WHERE id = $2
            RETURNING ext_capacity, updated_at, status`;

        // Setup values
        let values = [ JSON.stringify(body.extCapacity), id];
        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), status: data.status, extCapacity: data.extCapacity }))
            .catch((err) => reject(err));
    }),


    updateEventFigures: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
            SET updated_at = now(),
            figures = $1::jsonb
            WHERE id = $2
            RETURNING figures, updated_at`;

        // Setup values
        let values = [ body.figures, id];
        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id),  figures: data.figures, updated: data.updated_at}))
            .catch((err) => reject(err));
    }),

    updateEventResources: (id, body) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
            SET updated_at = now(),
            resources =  $1::jsonb
            WHERE id = $2
            RETURNING resources, updated_at, status`;

        // Setup values
        let values = [ body.resources, id];

        // Execute
        logger.debug(query, values);
        db.oneOrNone(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), status: data.status, resources: data.resources }))
            .catch((err) => reject(err));
    }),


    activateEvent: (body) => new Promise((resolve, reject) => {
        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
      SET subscribers = array_distinct(subscribers || $1)
      WHERE id = $2
      RETURNING id, subscribers`;

        // Setup values
        let values = [ body.emailsArray, body.id ];

        // Execute
        logger.debug(query);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(data.id) , subscribers: data.subscribers })) // eslint-disable-line no-unused-vars
            .catch((err) => reject(err));
    }),

    ReActivateEvent: (event_id) => new Promise((resolve, reject) => {
        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
			SET status = $1,
          updated_at = now()
			WHERE id = $2
			RETURNING id, status, type, created_at, updated_at, report_key, metadata, ST_X(the_geom) as lng, ST_Y(the_geom) as lat`;

        // Setup values
        let values = [ 'active', event_id];

        // Execute
        logger.debug(query, values);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: data.id, status: data.status, type:data.type, created: data.created, reportkey:data.report_key, metadata:data.metadata, lat: data.lat, lng: data.lng }))
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

                db.one(query, values).timeout(config.PGTIMEOUT)
                    .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                    .catch((err) => reject(err));


            });
        } else {

            // Setup values
            let values = [ body.location.lng, body.location.lat, {'country':'unknown'}, id ];

            db.one(query, values).timeout(config.PGTIMEOUT)
                .then((data) => resolve({ id: data.id, status: data.status, type:body.type, created: body.created, reportkey:data.report_key, metadata:body.metadata, uuid: data.uuid, the_geom:data.the_geom }))
                .catch((err) => reject(err));

        }

    }),

    /**
   * unsubscribe from an event
   * @param {integer} id ID of event
   * @param {string} email Email to unsubscribe
   */
    unsubscribe: (id, email) => new Promise((resolve, reject) => {

        // Setup query
        let query = `UPDATE ${config.TABLE_EVENTS}
      SET subscribers = array_remove(subscribers,$2)
      WHERE id = $1
      RETURNING id,subscribers`;

        // Setup values
        let values = [ id, email ];

        // Execute
        logger.debug(query, values);
        db.one(query, values).timeout(config.PGTIMEOUT)
            .then((data) => resolve({ id: String(id), subscribers: data.subscribers })) // eslint-disable-line no-unused-vars
            .catch((err) => reject(err));
    }),

    inviteToSubscribe: (id, data ) => new Promise((resolve,reject) => {
        mail(config,logger).emailInviteToSubscribe(data,id)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    }),

    /**
    * DELETE an event from the database
    * @param {integer} id ID of contact
    */
    deleteEvent: (id) => new Promise((resolve, reject) => {

        // Setup query
        let query1 = `DELETE FROM ${config.TABLE_REPORTS} WHERE event_id = $1`;
        let query2 = `DELETE FROM ${config.TABLE_EVENTS} WHERE id = $1 returning id`;

        // Setup values
        let values = [ id ];

        // Execute
        logger.debug(query1+' ; '+query2, values);
        db.any(query1,values).then(()=>(db.oneOrNone(query2, values))).timeout(config.PGTIMEOUT)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    })

});
