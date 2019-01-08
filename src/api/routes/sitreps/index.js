import { Router } from 'express';

// Import our data model
import sitReps from './model';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated, ensureAuthenticatedWrite, handleResponse } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import { celebrate as validate } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get all sitReps
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            query: {
                eventId: Joi.number().integer().min(1)
            }
        }),
        (req, res, next) => sitReps(config, db, logger).all(req.query.eventId)
            .then((data) => handleResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // create or update a event notification
    api.post('/', ensureAuthenticatedWrite,
        validate({
            body: Joi.object().keys({
                eventId: Joi.number().integer().min(1),
                created: Joi.date().iso().required(),
                description: Joi.string().required(),
                username: Joi.string(),
                files: Joi.array().items(Joi.string())
            })
        }),
        (req, res, next) => {
            sitReps(config, db, logger).createSitRep(req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Update an report record in the database
    api.put('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                username: Joi.string().allow(null),
                updated: Joi.date().iso().required(),
                description: Joi.string().required(),
                files: Joi.array().items(Joi.string())
            })
        }),
        (req, res, next) => {
            sitReps(config, db, logger).updateSitRep(req.params.id, req.body)
                .then((data) => handleResponse(data, req, res, next))
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
            sitReps(config, db, logger).deleteSitRep(req.params.id)
                .then(() => res.status(200).json({ statusCode: 200, time: new Date().toISOString(), result: 'SITREP deleted', id: req.params.id }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
