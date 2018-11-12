import { Router } from 'express';

// Import our data model
import reports from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';

// Import validation dependencies
import { celebrate as validate, Joi } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get a list of all reports
    api.get('/', ensureAuthenticated,
        validate({
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
                eventId: Joi.number().integer().min(1),
                since: Joi.string().min(10) // todo: see if Joi has ISO 8601 checking
            }
        }),
        (req, res, next) => reports(config, db, logger).all(req.query.hasOwnProperty('eventId') ? req.query.eventId : null, req.query.since)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Get a single report
    api.get('/:id', ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => reports(config, db, logger).byId(req.params.id)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // Create a new report record in the database
    api.post('/',
        validate({
            body: Joi.object().keys({
                eventId: Joi.number().integer().min(1),
                status: Joi.string().valid(config.API_REPORT_STATUS_TYPES).required(),
                created: Joi.date().iso().required(),
                reportkey: Joi.string(),
                content: Joi.object().required(),
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                })
            })
        }),
        (req, res, next) => {
            reports(config, db, logger).createReport(req.body)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    api.post('/linktoevent/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                eventId: Joi.number().integer().min(1).required()
            })
        }),
        (req, res, next) => {
            reports(config, db, logger).linkToEvent(req.params.id, req.body.eventId)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }

    );

    // Update an report record in the database
    api.post('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                eventId: Joi.number().integer().min(1),
                status: Joi.string().valid(config.API_REPORT_STATUS_TYPES).required(),
                content: Joi.object().required()
            })
        }),
        (req, res, next) => {
            reports(config, db, logger).updateReport(req.params.id, req.body)
                .then((data) => handleGeoResponse(data, req, res, next))
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
