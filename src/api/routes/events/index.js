import { Router } from 'express';

// Import our data model
import events from './model';
import missions from './../missions/model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';

// Import validation dependencies
import { celebrate as validate, Joi } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Validation schema
    const schemaGetAll = Joi.object().keys(
        {
            search: Joi.string().min(1),
            since: Joi.string().min(10), // todo: explore Joi ISO 8601 validation
            geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
            status: Joi.any().valid(config.API_EVENT_STATUS_TYPES),
            country: Joi.string(),
            lng: Joi.number().min(-180).max(180),
            lat: Joi.number().min(-90).max(90),
        }
    ).with('lng', 'lat');

    // Get a list of all events
    api.get('/', ensureAuthenticated,
        validate({
            query: schemaGetAll
        }),
        (req, res, next) => {
            const location = {
                lng: req.query.lng,
                lat: req.query.lat
            };
            events(config, db, logger).all(req.query.status, req.query.country, location, req.query.search, req.query.since)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Get a single event
    api.get('/:id',ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => events(config, db, logger).byId(req.params.id)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Create a new event record in the database
    api.post('/',ensureAuthenticatedWrite,
        validate({
            body: Joi.object().keys({
                status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).required(),
                type: Joi.string().required(),
                // types: Joi.array().items(Joi.string()),
                report_id: Joi.number().min(1),
                created_at: Joi.date().iso().required(),
                metadata: Joi.object().required().keys({
                    user: Joi.string().allow(null),
                    name: Joi.string().allow(''),
                    project_code: Joi.string().allow(''),
                    description: Joi.string().allow(''),
                    sub_type: Joi.string().allow(''), // TODO: change to array later
                    event_datetime: Joi.string().allow(''),
                    event_status: Joi.string(),
                    incharge_name: Joi.string().allow(''),
                    incharge_position: Joi.string().allow(''),
                    severity: Joi.string().allow(''),
                    severity_scale: Joi.number().min(1).max(3),
                    sharepoint_link: Joi.string().allow(''),
                    security_details: Joi.string().allow(''),
                    bounds: Joi.object(),
                    areas: Joi.array().items(Joi.object().keys({
                        country: Joi.string(),
                        region: Joi.string()
                    })),
                    severity_measures: Joi.array().items(Joi.object().keys({
                        scale: Joi.number().min(1).max(3),
                        description: Joi.string().allow('')
                    }))
                }),
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                })
            })
        }),
        (req, res, next) => {
            events(config, db, logger).createEvent(req.body)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Update an event record in the database
    api.put('/:id',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).required(),
                type: Joi.string().allow(''),
                metadata: Joi.object().required()
            })
        }),
        (req, res, next) => {
            if(req.body.type === ''){
                delete req.body.type; // in the case that type is empty, don't update that field
            }
            events(config, db, logger).updateEvent(req.params.id, req.body)
                .then((data) => {
                    if (req.body.status === 'inactive') {
                        // backfill location for compatibility
                        console.log(data); // eslint-disable-line no-console
                        req.body['location'] = {'lat': data.lat, 'lng': data.lng};
                        missions(config, db, logger).createMission(req.body)
                            .then((data) => handleGeoResponse(data, req, res, next))
                            .catch((err) => {
                                /* istanbul ignore next */
                                logger.error(err);
                                /* istanbul ignore next */
                                next(err);
                            });
                    } else {
                        handleGeoResponse(data, req, res, next);
                    }
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Update an event record's location in the database
    api.patch('/updatelocation/:id',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                })
            })
        }),
        (req, res, next) => {
            events(config, db, logger).updateLocation(req.params.id, req.body)
                .then((data) => {
                    handleGeoResponse(data, req, res, next);

                })
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Delete an event's record and associated reports from the database
    api.delete('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() }
        }),
        (req, res, next) => {
            events(config, db, logger).deleteEvent(req.params.id)
                .then((data) => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'event deleted', id:data.id }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
