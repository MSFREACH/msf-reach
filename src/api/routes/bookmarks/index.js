import { Router } from 'express';

// Import our data model
import bookmarks from './model';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated, handleResponse } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import { celebrate as validate } from 'celebrate';


export default ({ config, db, logger }) => {
    let api = Router();

    // Get all bookmarks
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        // handle off to the database function in model.js:
        (req, res, next) => bookmarks(config, db, logger).all((req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null)
            .then((data) => handleResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // create or update a user bookmark
    api.post('/',
        validate({
            body: Joi.object().keys({
                markdown: Joi.string().required()
            })
        }),
        (req, res, next) => {
            bookmarks(config, db, logger).createOrUpdateBookmark((req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null,req.body.markdown)
                .then((data) => handleResponse(data, req, res, next))
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
