import { Router } from 'express';

// Import our data model
import missions from './model';
import events from './../events/model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';

// Import validation dependencies

import { celebrate as validate , Joi  } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // get all historical missions
    api.get('/', ensureAuthenticated, cacheResponse('10 minutes'),
        validate({
            query: {
                search: Joi.string().min(1),
                country: Joi.string(),
                latmin: Joi.number().min(-90).max(90),
                lngmin: Joi.number().min(-180).max(180),
                latmax: Joi.number().min(-90).max(90),
                lngmax: Joi.number().min(-180).max(180),
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => missions(config, db, logger).all(req.query.search,{
            xmin: req.query.lngmin,
            ymin: req.query.latmin,
            xmax: req.query.lngmax,
            ymax: req.query.latmax
        },req.query.country).then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // get an individual historical mission by id
    api.get('/:id',ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => missions(config, db, logger).byId(req.params.id)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );
    // Update a mission record in the database
    api.put('/:id',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                status: Joi.string().required(),
                metadata: Joi.object().required(),
                eventId: Joi.number().integer().allow(null)
            })
        }),
        (req, res, next) => {
            missions(config, db, logger).updateMission(req.params.id, req.body)
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

    // ReActive an event tied to a mission
    api.post('/eventactivate/:id',ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                eventId: Joi.number().integer().required()
            })
        }),
        (req, res, next) => {
            events(config, db, logger).ReActivateEvent(req.body.eventId)
                .then((data) => {
                    handleGeoResponse(data, req, res, next);
                    //deleting current mission; can happen async
                    missions(config, db, logger).deleteMission(req.params.id)
                        .then(() =>{
                            logger.info('mission '+req.params.id+ ' successfully deleted.');
                        })
                        .catch((err) => {
                            /* istanbul ignore next */
                            logger.error(err);
                            /* istanbul ignore next */
                            next(err);
                        });
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Delete a mission's record from the database
    api.delete('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() }
        }),
        (req, res, next) => {
            missions(config, db, logger).deleteMission(req.params.id)
                .then(() => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'mission deleted' }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
