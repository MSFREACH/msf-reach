import Promise from 'bluebird';

import { Router } from 'express';

// Import any required utility functions
import { cacheResponse, jwtCheck } from '../../../lib/util';

import {GeoRSS} from '../../../lib/pdc-georss.js';
import { USGSGeoRSS } from "../../../lib/usgs-georss.js";
import { TSRMain } from "../../../lib/tsr.js";

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

export default ({ logger }) => {
	let api = Router();

	// Get a list of all reports
	api.get('/', jwtCheck, cacheResponse('10 minutes'),
		(req, res, next) => GeoRSS()
			.then((events) => {
				res.status(200).json({statusCode: 200, time:new Date().toISOString(), result:events});
			})
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

    api.get('/usgs', jwtCheck, cacheResponse('10 minutes'),
        (req, res, next) => USGSGeoRSS()
            .then((events) => {
                res.status(200).json({statusCode: 200, time:new Date().toISOString(), result:events});
            })
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    api.get('/tsr', jwtCheck, cacheResponse('10 minutes'),
        (req, res, next) => TSRMain()
            .then((events) => {
                res.status(200).json({statusCode: 200, time:new Date().toISOString(), result:events});
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
