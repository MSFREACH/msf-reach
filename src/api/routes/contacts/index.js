import { Router } from 'express';

// Import our data model
import contacts from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, jwtCheck } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Import ID generator
import shortid from 'shortid';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all events
	api.get('/', jwtCheck, cacheResponse('10 minutes'),
		(req, res, next) => contacts(config, db, logger).all()
			.then((data) => res.status(200).json({statusCode: 200, result:data}))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	return api;
};
