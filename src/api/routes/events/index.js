import { Router } from 'express';

// Import our data model
import events from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all reports
	api.get('/', cacheResponse('1 minute'),
    validate({
      query: {
        geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
				status: Joi.any().valid(config.EVENT_STATUS_TYPES)
      }
    }),
		(req, res, next) => events(config, db, logger).all(req.query.status)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Get a single report

	api.get('/:id', cacheResponse('1 minute'),
		validate({
			params: { id: Joi.number().integer().required() } ,
			query: {
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => events(config, db, logger).byId(req.params.id)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	// Create a new event record in the database

	api.post('/',
		validate({
			body: Joi.object().keys({
				status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).required(),
				type: Joi.string().valid(config.API_EVENT_TYPES).required(),
				created: Joi.date().iso().required(),
				metadata: Joi.object().required(),
				location: Joi.object().required().keys({
					lat: Joi.number().min(-90).max(90).required(),
					lng: Joi.number().min(-180).max(180).required()
				})
			})
		}),
		(req, res, next) => events(config, db, logger).addEvent()
		.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				logger.error(err);
				next(err);
			})
	);

	return api;
};
