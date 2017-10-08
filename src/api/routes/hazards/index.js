import Promise from 'bluebird';

import { Router } from 'express';

// Import any required utility functions
import { cacheResponse, jwtCheck } from '../../../lib/util';

import { PDC } from '../../../lib/pdc-georss.js';
import { USGS } from "../../../lib/usgs-georss.js";
import { TSR } from "../../../lib/tsr.js";
import { GDACS } from "../../../lib/gdacs-georss.js";
import { PTWC } from "../../../lib/ptwc-georss.js";
import { avalanche } from "../../../lib/avalanche.js";


// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

export default ({ logger }) => {
	let api = Router();

	// Get a list of all reports
	api.get('/pdc', jwtCheck, cacheResponse('10 minutes'),
		(req, res, next) => PDC()
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
        (req, res, next) => USGS()
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
        (req, res, next) => TSR()
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

		api.get('/gdacs', jwtCheck, cacheResponse('10 minutes'),
				(req, res, next) => GDACS()
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

		api.get('/ptwc', jwtCheck, cacheResponse('10 minutes'),
				(req, res, next) => PTWC()
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

		api.get('/avalanche', jwtCheck, cacheResponse('10 minutes'),
				(req, res, next) => avalanche()
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
