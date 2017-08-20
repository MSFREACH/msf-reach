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

	api.get('/', jwtCheck, cacheResponse('1 minute'),
    validate({
      query: {
        geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
      }
    }),
		(req, res, next) => contacts(config, db, logger).all(req.query.status)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	// Create a new contact record in the database
	api.post('/',
		validate({
			body: Joi.object().keys({
				properties: Joi.object().required(),
				location: Joi.object().required().keys({
					lat: Joi.number().min(-90).max(90).required(),
					lng: Joi.number().min(-180).max(180).required()
				})
			})
		}),
		(req, res, next) => {
			contacts(config, db, logger).createContact(req.body)
			.then((data) => handleGeoResponse(data, req, res, next))
				.catch((err) => {
					/* istanbul ignore next */
					logger.error(err);
					/* istanbul ignore next */
					next(err);
				})
		}
	);

	// Update a contact record in the database
	api.post('/:id', jwtCheck,
		validate({
			params: { id: Joi.number().integer().min(1).required() } ,
			body: Joi.object().keys({
				properties: Joi.object().required()
			})
		}),
		(req, res, next) => {
			contacts(config, db, logger).updateContact(req.params.id, req.body)
			.then((data) => handleGeoResponse(data, req, res, next))
				.catch((err) => {
					/* istanbul ignore next */
					logger.error(err);
					/* istanbul ignore next */
					next(err);
				})
		}
	);

	return api;
};
