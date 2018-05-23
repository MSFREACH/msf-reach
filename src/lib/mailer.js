/**
send emails
**/

import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import request from 'request';

export default ( config, logger ) => ({

    sendContactUpdateEmail: (recipient, theGUID) => new Promise((resolve, reject) => {

        const smtpConfig = {
            host: 'email-smtp.us-west-2.amazonaws.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS
            }
        };

        const transport = nodemailer.createTransport(smtpConfig);

        const options={
            viewEngine: {},
            viewPath: 'public/email-templates/',
            extName: '.hbs'
        };

        //attach the plugin to the nodemailer transporter
        transport.use('compile', hbs(options));

        let uLink=config.BASE_URL+'contact/?token='+theGUID+'&email='+recipient;

        let emContext={ updateLink: uLink ,expiresIn: config.PEER_GUID_TIMEOUT/3600 };

        const mailOptions = {
            from: 'MSF-REACH <admin@msf-reach.org>', // sender address
            to: recipient,
            subject: 'Update your MSF-REACH contact details',
            template: 'plain',
            context: emContext
        };

        // send mail with defined transport object
        logger.info('Sending email to ' + recipient);
        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error(error.message);
                reject(error);
            }
            else
            {
                logger.info('Email %s sent: %s', info.messageId, info.response);
                resolve(info); // fixme probably want to resolve something useful
            }
        });
    }),

    sendShareNotificationEmail: (access_token, sender_oid, recipient_oid, contact_data) => new Promise((resolve, reject) => {

        const smtpConfig = {
            host: 'email-smtp.us-west-2.amazonaws.com',
            port: 465,
            secure: true,
            requireTLS: true,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS
            }
        };

        const transport = nodemailer.createTransport(smtpConfig);

        const options={
            viewEngine: {},
            viewPath: 'public/email-templates/',
            extName: '.hbs'
        };

        //attach the plugin to the nodemailer transporter
        transport.use('compile', hbs(options));

        request.get('https://graph.microsoft.com/v1.0/users/'+sender_oid, {
            'headers': {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            }
        }, function(err, res, body1) {
            if(err){
                logger.error(err.message);
                reject(err);
            }
            else{

                request.get('https://graph.microsoft.com/v1.0/users/'+recipient_oid, {
                    'headers': {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type': 'application/json'
                    }
                }, function(err, res, body2) {
                    if(err){
                        logger.error(err.message);
                        reject(err);
                    }
                    else {
                        let sender = JSON.parse(body1);
                        let recipient = JSON.parse(body2);

                        let emContext={sender_name: sender.displayName, recipient_name: recipient.displayName, contact_name: contact_data.properties.name };

                        const mailOptions = {
                            from: 'MSF-REACH <admin@msf-reach.org>', // sender address -
                            to: 'mattjb@icloud.com', //update to receipient.mail
                            subject: 'Contact share notification',
                            template: 'share',
                            context: emContext
                        };

                        // send mail with defined transport object
                        logger.info('Sending sharing email notification');
                        transport.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                logger.error(error.message);
                                reject(error);
                            }
                            else
                            {
                                logger.info('Email %s sent: %s', info.messageId, info.response);
                                resolve(contact_data); // pass contact data back out for next promise
                            }
                        });
                    }
                });
            }
        });
    })
});
