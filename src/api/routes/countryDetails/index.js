import { Router } from 'express';

// Import our data model
import countryDetails from './model';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated, handleResponse } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import { celebrate as validate } from 'celebrate';


export default ({ config, db, logger }) => {
    let api = Router();

    // Get all countryDetails
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            query: {
                countries: Joi.array().items(Joi.string())
            }
        }),
        // handle off to the database function in model.js:
        (req, res, next) => countryDetails(config, db, logger).all(req.query.countries)
            .then((data) => handleResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // create a country detail row
    api.post('/', ensureAuthenticatedWrite,
        validate({
            body: Joi.object().keys({
                country: Joi.string().required(),
                country_code: Joi.string().required(),
                category: Joi.string().valid(config.API_COUNTRY_DETAIL_CATEGORY),
                type: Joi.string().valid(config.API_COUNTRY_DETAIL_TYPES),
                metadata: Joi.object().keys({
                    name: Joi.string().optional(),
                    operational_center: Joi.string().valid(config.API_OPERATIONAL_CENTERS),
                    url: Joi.string().uri({ scheme: ['http', 'https'] }),
                    description: Joi.string().optional()
                })
            })
        }),
        (req, res, next) => {
            countryDetails(config, db, logger).createDetail(req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Update a ountry detail row in the database
    api.put('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                metadata: Joi.object().keys({
                    name: Joi.string().optional(),
                    operational_center: Joi.string().valid(config.API_OPERATIONAL_CENTERS),
                    url: Joi.string().uri({ scheme: ['http', 'https'] }),
                    description: Joi.string().optional()
                })
            })
        }),
        (req, res, next) => {
            countryDetails(config, db, logger).updateDetail(req.params.id, req.body)
                .then((data) => handleResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Delete a country detail row
    api.delete('/:id', ensureAuthenticatedWrite,
        validate({
            params: { id: Joi.number().integer().min(1).required() }
        }),
        (req, res, next) => {
            countryDetails(config, db, logger).deleteDetail(req.params.id)
                .then(() => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'country detail deleted', id: req.params.id }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
