import { Router } from 'express';

// Import our data model
import eventNotifications from './model';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated, ensureAuthenticatedWrite, handleResponse } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import { celebrate as validate } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get all eventNotifications
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            query: {
                eventId: Joi.number().integer().min(1)
            }
        }),
        (req, res, next) => eventNotifications(config, db, logger).all(req.query.hasOwnProperty('eventId') ? req.query.eventId : null)
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
                category: Joi.string(),
                created: Joi.date().iso().required(),
                description: Joi.string().required(),
                username: Joi.string(),
                files: Joi.array().items(Joi.string())
            })
        }),
        (req, res, next) => {
            eventNotifications(config, db, logger).createEventNotification(req.body)
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
                category: Joi.string(),
                updated: Joi.date().iso().required(),
                description: Joi.string().required(),
                files: Joi.array().items(Joi.string())
            })
        }),
        (req, res, next) => {
            eventNotifications(config, db, logger).updateEventNotification(req.params.id, req.body)
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
            eventNotifications(config, db, logger).deleteEventNotification(req.params.id)
                .then((data) => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'event notification deleted', id:data.id }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
