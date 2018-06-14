import { Router } from 'express';

// Import our data model
import layers from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated, ensureAuthenticatedWrite } from '../../../lib/util';

// Import validation dependencies
import { celebrate as validate, Joi } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get a single layer
    api.get('/:layer',ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            params: { layer: Joi.string().required() } ,
        }),
        (req, res, next) => layers(config, db, logger).byName(req.params.layer)
            .then((data) => res.status(200).json(data))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    return api;
};
