import { Router } from 'express';
// Import our data model
import msfResponses from './model';
// Import any required utility functions
import { cacheResponse, handleResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';
// Import validation dependencies
import { celebrate as validate, Joi } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get a list of all responses
    api.get('/', ensureAuthenticated,
        validate({
            query: {
                eventId: Joi.number().integer().min(1)
            }
        }),
        (req, res, next) => msfResponses(config, db, logger).all(req.query.eventId)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
            /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Get a single event
    api.get('/:id',ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => msfResponses(config, db, logger).byId(req.params.id)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );


    // Create a new response record in the database
    api.post('/',ensureAuthenticatedWrite,
        validate({
            body: Joi.object().keys({
                eventId: Joi.number().integer().min(1).required(),
                eventStatus: Joi.string().required(),
                metadata: Joi.object().keys({
                    type: Joi.string().valid(config.API_MSF_RESPONSE_TYPES),
                    start_date: Joi.date().iso(),
                    end_date: Joi.date().iso(),
                    total_days: Joi.number().integer(),
                    description: Joi.string(),
                    sharepoint_link: Joi.string()
                }),
                area: Joi.object().keys({
                    type: Joi.string(),
                    coordinates: Joi.array().items(Joi.array())
                }),
                location: Joi.object().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                }),
                programmes: Joi.array().items(Joi.object().keys({
                    name: Joi.string().allow(''),
                    value: Joi.string().allow(''),
                    deployment_scale: Joi.number().min(1).max(10),
                    open_date: Joi.date().iso(),
                    notes: Joi.string().allow('')
                }))
            })
        }),
        (req, res, next) => msfResponses(config, db, logger).createResponse(req.body)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Update an response record in the database
    api.put('/:id',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                event_status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).optional(),
                project_code: Joi.string().allow(null, ''),
                operational_center: Joi.string().allow(null, ''),
                metadata: Joi.object().required().keys({
                    type: Joi.string().valid(config.API_MSF_RESPONSE_TYPES),
                    start_date: Joi.date().iso(),
                    end_date: Joi.date().iso(),
                    total_days: Joi.number().integer(),
                    description: Joi.string(),
                    sharepoint_link: Joi.string()
                }),
                programmes: Joi.array().items(Joi.object().keys({
                    name: Joi.string().allow(null, ''),
                    value: Joi.string().allow(null, ''),
                    deployment_scale: Joi.number().min(1).max(10),
                    open_date: Joi.date().iso(),
                    notes: Joi.string().allow(null, '')
                }))
            })
        }),
        (req, res, next) => msfResponses(config, db, logger).updateResponse(req.params.id, req.body)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Delete an event's record and associated reports from the database
    api.delete('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() }
        }),
        (req, res, next) => {
            msfResponses(config, db, logger).deleteResponse(req.params.id)
                .then((data) => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'response deleted', id:data.id }))
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
