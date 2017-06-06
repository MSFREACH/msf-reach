import { Router } from 'express';

// Import our data model
import events from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse } from '../../../lib/util';

// Import validation dependencies
import Joi from 'joi';
import validate from 'celebrate';

// Import ID generator
import shortid from 'shortid';

export default ({ config, db, logger }) => {
	let api = Router();

	// Get a list of all events
	api.get('/', cacheResponse('1 minute'),
    validate({
      query: {
        geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT),
				status: Joi.any().valid(config.API_EVENT_STATUS_TYPES)
      }
    }),
		(req, res, next) => events(config, db, logger).all(req.query.status)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
				next(err);
			})
	);

	// Get a single event
	api.get('/:id', cacheResponse('1 minute'),
		validate({
			params: { id: Joi.number().integer().min(1).required() } ,
			query: {
				geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
			}
		}),
		(req, res, next) => events(config, db, logger).byId(req.params.id)
			.then((data) => handleGeoResponse(data, req, res, next))
			.catch((err) => {
				/* istanbul ignore next */
				logger.error(err);
				/* istanbul ignore next */
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
		(req, res, next) => {
			let reportKey = shortid.generate();
			events(config, db, logger).createEvent(reportKey, req.body)
			.then((data) => handleGeoResponse(data, req, res, next))
				.catch((err) => {
					/* istanbul ignore next */
					logger.error(err);
					/* istanbul ignore next */
					next(err);
				})
		}
	);

	// Update an event record in the database
	api.post('/:id',
		validate({
			params: { id: Joi.number().integer().min(1).required() } ,
			body: Joi.object().keys({
				status: Joi.string().valid(config.API_EVENT_STATUS_TYPES).required(),
				metadata: Joi.object().required()
			})
		}),
		(req, res, next) => {
			events(config, db, logger).updateEvent(req.params.id, req.body)
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
