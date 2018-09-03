import { Router } from 'express';

// Import our data model
import missions from './model';
import events from './../events/model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated } from '../../../lib/util';

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
    api.put('/:id',ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                status: Joi.string().required(),
                metadata: Joi.object().required(),
                eventId: Joi.number().integer().required()
            })
        }),
        (req, res, next) => {
            missions(config, db, logger).updateMission(req.params.id, req.body)
                .then((data) => {
                    if(req.body.status === 'active'){
                        events(config, db, logger).activateEvent(req.body)
                            .then((data) => handleGeoResponse(data, req, res, next))
                            .catch((err) => {
                                /* istanbul ignore next */
                                logger.error(err);
                                /* istanbul ignore next */
                                next(err);
                            });
                    }else{
                        handleGeoResponse(data, req, res, next)
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

    return api;
};
