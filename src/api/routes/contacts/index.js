import { Router } from 'express';

// Import our data model
import contacts from './model';


import peers from './update';

import request from 'request';

import mail from '../../../lib/mailer';

import { parse as json2csv } from  'json2csv';


// Import any required utility functions
import { cacheResponse, handleGeoResponse, ensureAuthenticated } from '../../../lib/util';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import { celebrate as validate } from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Add peers subroute
    api.use('/peers', peers({config, db, logger}));

    // Get all contacts
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
    api.post('/',
        validate({
            body: Joi.object().keys({
                properties: Joi.object().required().keys({
                    // could probably tighten some of these up
                    address: Joi.string().allow(''),
                    title: Joi.string().allow(''),
                    otherNames: Joi.string().allow(''),
                    gender: Joi.string().allow(''),
                    name: Joi.string().allow(''),
                    speciality: Joi.string().allow(''),
                    type: Joi.string().allow(''),
                    employer: Joi.string().allow(''),
                    job_title: Joi.string().allow(''),
                    division: Joi.string().allow(''),
                    dob: Joi.string().allow(''),
                    web: Joi.string().allow(''),
                    OC: Joi.string().allow(''),
                    msf_employment: Joi.string().allow(''),
                    msf_additional: Joi.string().allow(''),
                    cell: Joi.string().allow(''),
                    work: Joi.string().allow(''),
                    home: Joi.string().allow(''),
                    fax: Joi.string().allow(''),
                    msf_associate: Joi.boolean().allow(''),
                    msf_peer: Joi.boolean().allow(''),
                    email: Joi.string().required(),
                    email2: Joi.string().allow(''),
                    sharepoint: Joi.string().allow(''),
                    WhatsApp: Joi.string().allow(''),
                    Facebook: Joi.string().allow(''),
                    Twitter: Joi.string().allow(''),
                    Instagram: Joi.string().allow(''),
                    Telegram: Joi.string().allow(''),
                    Skype: Joi.string().allow(''),
                    msf_entered: Joi.boolean().required()
                }),
                oid: Joi.string().uuid(),
                private: Joi.boolean().required(),
                location: Joi.object().required().keys({
                    lat: Joi.number().min(-90).max(90).required(),
                    lng: Joi.number().min(-180).max(180).required()
                })
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).createContact((req.body.hasOwnProperty('oid')) ? req.body.oid : null, req.body)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    // In this case we want to explicity return a 409
                    if (err.message === 'Contact already exists'){
                        res.status(409).json({ statusCode: 409, message: err.message});
                    }
                    // Handle all other errors as normal
                    else {
                        /* istanbul ignore next */
                        next(err);
                    }
                });
        }
    );

    // Update a contact record in the database
    api.patch('/:id', ensureAuthenticatedWrite,
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

    api.get('/csv/download',ensureAuthenticated,
        validate({
            query: {
                latmin: Joi.number().min(-90).max(90),
                lngmin: Joi.number().min(-180).max(180),
                latmax: Joi.number().min(-90).max(90),
                lngmax: Joi.number().min(-180).max(180)
            }
        }),
        (req,res,next)=>{
            contacts(config, db, logger).forCSV(req.query.lngmin, req.query.latmin, req.query.lngmax, req.query.latmax, (req.hasOwnProperty('user') && req.user.hasOwnProperty('oid')) ? req.user.oid : null).then((data) => {
                let jsonList=data.map((item) => {return item.properties;});
                //console.log(jsonList);
                let fields=  ['title','name','otherNames','type','job_title','OC','email','email2','cell','home','work','address','Facebook','Telegram','WhatsApp','Instagram'];
                //let fieldNames= ['title','name','alias','type','job title','OC (if MSF)', 'email', 'alternate email', 'mobile phone', 'home phone','work phone','address','Facebook','Telegram','WhatsApp','Instagram'];
                let csv = json2csv(jsonList,{fields: fields});
                //console.log(csv);
                csv = ',"Exported on '+(new Date(Date.now())).toUTCString()+', check back on MSF REACH regularly for updates."\n'+csv;
                res.setHeader('Content-disposition', 'attachment; filename=contacts.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send(csv);
                //console.log(res);
                return res;

            }).catch((err) => {
                /* istanbul ignore next */
                logger.error(err);
                /* istanbul ignore next */
                next(err);
            });
        });


    // Delete a contact's record from the database
    api.delete('/:id', ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() }
        }),
        (req, res, next) => {
            contacts(config, db, logger).deleteContact(req.params.id)
                .then(() => res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'contact deleted' }))
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    // Update a contact's sharedWith record in the database
    api.patch('/:id/share', ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                oid: Joi.string().uuid()
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).shareWith(req.params.id, req.user.oid, req.body.oid)
                .then((data) => mail(config,logger).sendShareNotificationEmail(req.user.access_token,req.user.oid,req.body.oid,data))
                .then((data) => handleGeoResponse(data, req, res, next))

                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );


    // Update a contact's privacy record in the database
    api.patch('/:id/private', ensureAuthenticated,
        validate({
            params: { id: Joi.number().integer().min(1).required() } ,
            body: Joi.object().keys({
                privacy: Joi.boolean().invalid(true).required()
            })
        }),
        (req, res, next) => {
            contacts(config, db, logger).privacy(req.params.id, req.user.oid, req.body.privacy)
                .then((data) => handleGeoResponse(data, req, res, next))
                .catch((err) => {
                    if (err.message === 'No data returned from the query.') {
                        // contact doesn't belong to us
                        res.send(403)('forbidden');
                    } else {
                        /* istanbul ignore next */
                        logger.error(err);
                        /* istanbul ignore next */
                        next(err);
                    }
                });
        }
    );

    // wrapper around MS Graph /users API
    api.get('/useridbyemail/:email',ensureAuthenticated,
        validate({
            params: { email: Joi.string().email().required() }
        }),
        function(req, response){
            request.get('https://graph.microsoft.com/v1.0/users/'+req.params.email, {
                'headers': {
                    'Authorization': 'Bearer ' + req.user.access_token,
                    'Content-Type': 'application/json'
                }
            }, function(err, res) {
                if(err){
                    logger.error(err);
                    response.status(404).send(res);
                }
                else{
                    //console.log('res: ' + res);
                    response.send(res);
                }
            });
        });

    // wrapper around MS Graph /users API
    api.get('/usersearch/:term', ensureAuthenticated,
        validate({
            params: { term: Joi.string().required() }
        }),
        function(req, response){
            request.get('https://graph.microsoft.com/v1.0/users?$filter=startswith(displayName,\''+req.params.term+'\')', {
                'headers': {
                    'Authorization': 'Bearer ' + req.user.access_token,
                    'Content-Type': 'application/json'
                }
            }, function(err, res) {
                if(err){
                    logger.error(err);
                    response.status(404).send(res);
                }
                else{
                    //console.log('res: ' + res);
                    response.send(res);
                }
            });
        });

    return api;
};
