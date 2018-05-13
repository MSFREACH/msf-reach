/**
routes/contacts/peers

These functions give un-authenticated peers the ability to edit their own contact card details. Verificiation is carried out against a GUID and original email address
stored against the user in the database. A one-time link can be sent to users using this information
**/

import { Router } from 'express';

// Import our data model
import update from './model';
import contacts from '../model'; // parent contact model
import mail from '../../../../lib/mailer';

// Import validation dependencies
import BaseJoi from 'joi';
import Extension from 'joi-date-extensions';
const Joi = BaseJoi.extend(Extension);
import validate from 'celebrate';

export default ({ config, db, logger }) => {
    let api = Router();

    // Request the creation of a unique link and email sent to user
    api.get('/',
        validate({
            query: {
                email: Joi.string().required()
            }
        }),
        (req ,res, next) => {
            // Request GUID from database
            update(config, db, logger).requestGUID(req.query.email)
                .then((data) => {
                    if (data !== null){
                        logger.info('Email user ' + data.guid);
                        mail(config, logger).sendContactUpdateEmail(req.query.email, data.guid);
                        res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'contact update link emailed to user', emailExists:true });
                    }
                    else {
                        // Email did not exist in database
                        logger.info('Contact not found, ' + req.query.email);
                        res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'error: email not found' , emailExists:false });
                    }
                })
                // Catch database errors
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Allow a peer to update their contact record in the database using one-time-link (GUID)
    api.patch('/',
        validate({
            query: {
                email: Joi.string().required(),
                guid: Joi.string().min(36).max(36).required()
            },
            body: Joi.object().keys({
                properties: Joi.object().required()
            })
        }),
        (req, res, next) => {
            // Validate the GUID against the email
            update(config, db, logger).validateGUID(req.query.email, req.query.guid)
                .then((data) => {
                    if (data !== null){
                        // Validation successful, update contact using ID
                        contacts(config, db, logger).updateContact(data.id, req.body)
                            .then(() => {
                                res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'updated contact successfully' });
                            })
                            .catch((err) => {
                                /* istanbul ignore next */
                                logger.error(err);
                                /* istanbul ignore next */
                                next(err);
                            });
                    }
                    else {
                        res.status(401).json({ statusCode: 401, time:new Date().toISOString(), result: 'contact GUID invalid or expired' });
                    }
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        }
    );

    // Delete a contact's record from the database
    api.delete('/',
        validate({
            query: {
                email: Joi.string().required(),
                guid: Joi.string().min(36).max(36).required()
            },
        }),
        (req, res, next) => {
            // Validate the GUID against the email
            update(config, db, logger).validateGUID(req.query.email, req.query.guid)
                .then((data) => {
                    if (data !== null){
                    // Validation successful, update contact using ID
                        contacts(config, db, logger).deleteContact(data.id)
                            .then(() => {
                                res.status(200).json({ statusCode: 200, time:new Date().toISOString(), result: 'deleted contact successfully' });
                            })
                            .catch((err) => {
                            /* istanbul ignore next */
                                logger.error(err);
                                /* istanbul ignore next */
                                next(err);
                            });
                    }
                    else {
                        res.status(401).json({ statusCode: 401, time:new Date().toISOString(), result: 'contact GUID invalid or expired' });
                    }
                })
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
