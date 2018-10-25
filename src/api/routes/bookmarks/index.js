import { Router } from 'express';

// Import our data model
import bookmarks from './model';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated, handleResponse } from '../../../lib/util';

export default ({ config, db, logger }) => {
    let api = Router();

    // Get all contacts
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        // handle off to the database function in model.js:
        (req, res, next) => bookmarks(config, db, logger).all((req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null, req.query.msf_associate,req.query.msf_peer,req.query.type)
            .then((data) => handleResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    return api;
};
