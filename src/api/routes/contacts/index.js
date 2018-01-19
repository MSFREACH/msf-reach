import { Router } from 'express';

// Import our data model
import contacts from './model';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, jwtCheck } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import validate from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    api.get('/', jwtCheck, cacheResponse('1 minute'),
        validate({
            query: {
                search: Joi.string().min(1),
                latmin: Joi.number().min(-90).max(90),
                lngmin: Joi.number().min(-180).max(180),
                latmax: Joi.number().min(-90).max(90),
                lngmax: Joi.number().min(-180).max(180),
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        (req, res, next) => contacts(config, db, logger).all(req.query.search,{
            xmin: req.query.lngmin,
            ymin: req.query.latmin,
            xmax: req.query.lngmax,
            ymax: req.query.latmax
        }).then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    api.get('/:id', jwtCheck, cacheResponse('1 minute'),
        validate({
            query: {
                params: { id: Joi.number().integer().min(1).required() }
            }
        }),
        (req, res, next) => contacts(config, db, logger).byId(req.params.id)
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

<<<<<<< HEAD
	// Create a new contact record in the database
	api.post('/',
		validate({
			body: Joi.object().keys({
				// TODO - create a Joi validation schema for contact properties
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
				});
		}
	);

    // Update a contact record in the database
    api.patch('/:id', jwtCheck,
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
                });
        }
    );

	// Update a contact's last_email_sent_at record in the database
	api.patch('/:id/emailtime', jwtCheck,
		validate({
			params: { id: Joi.number().integer().min(1).required() } ,
			body: Joi.object().keys({
 				date: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').required()
			})
		}),
		(req, res, next) => {
			contacts(config, db, logger).setLastEmailTime(req.params.id, req.body)
			.then((data) => handleGeoResponse(data, req, res, next))
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
