import { Router } from 'express';

// Import our data model
import contacts from './model';

import request from 'request';

// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated, addUser } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import validate from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // get all contacts
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        // validate http query to make sure it has everything in the right format:
        validate({
            query: {
                search: Joi.string().min(1),
                msf_associate: Joi.string(),
                msf_peer: Joi.string(),
                type: Joi.string(),
                latmin: Joi.number().min(-90).max(90),
                lngmin: Joi.number().min(-180).max(180),
                latmax: Joi.number().min(-90).max(90),
                lngmax: Joi.number().min(-180).max(180),
                geoformat: Joi.any().valid(config.GEO_FORMATS).default(config.GEO_FORMAT_DEFAULT)
            }
        }),
        // handle off to the database function in model.js:
        (req, res, next) => contacts(config, db, logger).all(req.query.search,{
            xmin: req.query.lngmin,
            ymin: req.query.latmin,
            xmax: req.query.lngmax,
            ymax: req.query.latmax
        },(req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null, req.query.msf_associate,req.query.msf_peer,req.query.type).then((data) => handleGeoResponse(data, req, res, next))
            .catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            })
    );

    // get an individual contact
    api.get('/:id', ensureAuthenticated, cacheResponse('1 minute'),
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

    // Create a new contact record in the database
    api.post('/', addUser,
        validate({
            body: Joi.object().keys({
                private: Joi.boolean(),
                // TODO - create a Joi validation schema for contact properties
                properties: Joi.object().required(),
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                })
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).createContact((req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null, req.body)
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
    api.patch('/:id', ensureAuthenticated,
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
    api.patch('/:id/emailtime', ensureAuthenticated,
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

    // Update a contact's sharedWith record in the database
    api.patch('/:id/share', ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                oid: Joi.string().uuid()
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).shareWith(req.params.id, req.body.oid)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Update a contact's sharedWith record in the database
    api.patch('/:id/private', ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                privacy: Joi.boolean().required()
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).privacy(req.params.id, req.body.privacy)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    api.get('/useridbyemail/:email',ensureAuthenticated,
        validate({
            params: { email: Joi.string().email().required() }
        }),
        function(req, response){
            request.get('https://graph.windows.net/users/'+req.params.email, {
                'headers': {
                    'Authorization': 'Bearer ' + req.user.access_token,
                    'Content-Type': 'application/json'
                }
            }, function(err, res) {
                if(err){
                    logger.error(err);
                    next(err);
                }
                else{
                    //console.log('res: ' + res);
                    response.send(res);
                }
            });
        });

    return api;
};
