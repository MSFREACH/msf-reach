import { Router } from 'express';

// Import any required utility functions
import { ensureAuthenticated } from '../../../lib/util';

import { PDC } from '../../../lib/pdc-georss.js';
import { USGS } from '../../../lib/usgs-georss.js';
import { TSR } from '../../../lib/tsr.js';
import { GDACS } from '../../../lib/gdacs-georss.js';
import { PTWC } from '../../../lib/ptwc-georss.js';
import { LRA } from '../../../lib/lracrisistracker.js';


export default ({ logger }) => {
    let api = Router();

    // Get a list of all reports
    api.get('/pdc', ensureAuthenticated,
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

    // The following get methods get hazards from different data sources
    api.get('/usgs', ensureAuthenticated,
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

    api.get('/tsr', ensureAuthenticated,
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

    api.get('/gdacs', ensureAuthenticated,
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

    api.get('/ptwc', ensureAuthenticated,
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

    // Get a list of all reports
    api.get('/lra', ensureAuthenticated,
        (req, res, next) => LRA()
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
