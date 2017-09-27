import { Router } from 'express';

// Import our data model
import missions from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, jwtCheck } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Import ID generator
import shortid from 'shortid';

export default ({ config, db, logger }) => {
    let api = Router();

    api.get('/', jwtCheck, cacheResponse('10 minutes'),
        validate({
            query: {
                search: Joi.string().min(1),
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => missions(config, db, logger).all(req.query.search)
            .then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    api.get('/:id',jwtCheck, cacheResponse('1 minute'),
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            query: {
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => missions(config, db, logger).byId(req.params.id)
            .then((data) => {
                res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: data });
            })
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    return api;
};
