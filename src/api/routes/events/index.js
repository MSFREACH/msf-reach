import { Router } from 'express';

// Import our data model
import events from './model';
import missions from './../missions/model';

// Import any required utility functions
import { cacheResponse, handleResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';

// Import validation dependencies
import { celebrate as validate, Joi } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Validation schema
    const schemaGetAll = Joi.object().keys(
        {
            search: Joi.string().min(1),
            types: Joi.array().items(Joi.string()),
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

            events(config, db, logger).all(req.query.status, req.query.country, location, req.query.types, req.query.search)
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

    // unsubscribe from event update emails
    api.post('/unsubscribe/:id',ensureAuthenticated,  cacheResponse('1 minute'),
        (req, res, next) => {
            let email= (req.user ? req.user._json.preferred_username : process.env.TESTEMAIL);
            events(config, db, logger).unsubscribe(req.params.id, email)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // unsubscribe others from event update emails
    api.post('/unsubscribeothers/:id',ensureAuthenticatedWrite,  cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                email: Joi.string().required().allow('')
            })
        }),
        (req, res, next) => {
            events(config, db, logger).unsubscribe(req.params.id, req.body.email)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // subscribe to event update emails
    api.post('/subscribeself/:id', ensureAuthenticated, cacheResponse('1 minute'),
        (req, res, next) => {
            let email= (req.user ? req.user._json.preferred_username : process.env.TESTEMAIL);
            events(config, db, logger).subscribe(req.params.id, [email])
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );
    // subscribe to event update emails
    api.post('/subscribeothers/:id', ensureAuthenticatedWrite, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                subscribers: Joi.array().required()
            })
        }),
        (req, res, next) => {
            events(config, db, logger).subscribe(req.params.id, req.body.subscribers)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // unsubscribe from event update emails
    api.post('/unsubscribeEmailLink/:id', cacheResponse('1 minute'),
        (req, res, next) => {
            events(config, db, logger).unsubscribe(req.params.id, req.body.email)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Create a new event record in the database
    api.post('/',ensureAuthenticatedWrite,
        validate({
            body: Joi.object().keys({
                status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).required(),
                type: Joi.string().required(),
                report_id: Joi.number().min(1),
                created_at: Joi.date().iso().required(),
                metadata: Joi.object().required().keys({
                    user: Joi.string().allow(null),
                    name: Joi.string().allow(''),
                    project_code: Joi.string().allow(''),
                    description: Joi.string().allow(''),
                    sub_type: Joi.string().allow(''), // TODO: change to array later
                    types: Joi.array().items(Joi.string()),
                    sub_types: Joi.array().items(Joi.string()),
                    status_updates: Joi.array().items(Joi.object().keys({
                        type: Joi.string(),
                        timestamp: Joi.date().iso()
                    })),
                    event_datetime: Joi.string().allow(''),
                    event_local_time: Joi.string().allow('', null),
                    event_local_timezone: Joi.string().allow('', null),
                    event_local_timezone_abbr: Joi.string().allow('', null),
                    event_status: Joi.string().valid(config.API_EVENT_STATUSES),
                    incharge_contact: Joi.object().keys({
                        local: Joi.object().keys({
                            name: Joi.string().allow(''),
                            position: Joi.string().allow('')
                        }),
                        operator: Joi.object().keys({
                            name: Joi.string().allow(''),
                            position: Joi.string().allow('')
                        })
                    }),
                    sharepoint_link: Joi.string().allow(null),
                    security_details: Joi.string().allow(''),
                    bounds: Joi.object(),
                    areas: Joi.array().items(Joi.object()),
                    severity_measures: Joi.array().items(Joi.object().keys({
                        scale: Joi.number().min(1).max(3),
                        description: Joi.string().allow('')
                    }))
                }),
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                }),
                subscribe: Joi.boolean()
            })
        }),
        (req, res, next) => {
            let userEmail=((req.body.subscribe && req.user ) ? req.user._json.preferred_username : null);
            events(config, db, logger).createEvent(req.body,userEmail)
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
                        // backfill type to metadata (goes in mission properties)
                        req.body.metadata['event_type']= req.body.type || '';
                        missions(config, db, logger).createMission(req.body,req.params.id)
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

    api.put('/:id/extCapacity',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                extCapacity: Joi.array().items(Joi.object().keys({
                    type: Joi.string(),
                    name: Joi.string(),
                    arrival_date: Joi.date().iso(),
                    deployment: Joi.string()
                })),
            })
        }),
        (req, res, next) => {
            events(config, db, logger).updateEventExtCapacity(req.params.id, req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    logger.error(err);
                    next(err);
                });
        });

    api.put('/:id/figures',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                figures: Joi.object().keys({
                    keyFigures: Joi.array().items(Joi.object().keys({
                        status: Joi.string().valid(config.API_EVENT_STATUSES),
                        figures: Joi.array().items(Joi.object())
                    })),
                    population: Joi.object().allow(null),
                    statistics: Joi.object().allow(null)
                })
            })
        }),
        (req, res, next) => {
            events(config, db, logger).updateEventFigures(req.params.id, req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    logger.error(err);
                    next(err);
                });
        });

    api.put('/:id/resources',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                resources: Joi.object().keys({
                    perStatus: Joi.array().items(Joi.object().keys({
                        status: Joi.string().valid(config.API_EVENT_STATUSES),
                        staff: Joi.object(),
                        budget: Joi.object(),
                        supply_chain: Joi.object()
                    })),
                    institutional_donors: Joi.array().items(Joi.object().keys({
                        from_who: Joi.string().allow(null),
                        amount: Joi.string().allow(null)
                    })),
                    visa_requirement: Joi.array().items(Joi.string()),
                    vaccination_requirement: Joi.object().keys({
                        required: Joi.array().items(Joi.string()).allow(null),
                        recommended: Joi.array().items(Joi.string()).allow(null)
                    })
                })
            })
        }),
        (req, res, next) => {
            events(config, db, logger).updateEventResources(req.params.id, req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    logger.error(err);
                    next(err);
                });
        });
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

    // invite users to subscribe
    api.post('/invitesubscribe/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                invitees: Joi.array().required()
            })
        }),
        (req, res, next) => {
            let inviteData={
                inviter: req.user,
                invitees: req.body.invitees
            };
            events(config, db, logger).inviteToSubscribe(req.params.id,inviteData)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                /* istanbul ignore next */
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
        }
    );

    return api;
};
