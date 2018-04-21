/**
send emails
**/

import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';



export default ( config, logger ) => ({

    send: (recipient, emContext) => new Promise((resolve, reject) => {

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
            viewPath: '../../public/etemplates/',
            extName: '.hbs'
        };

        //attach the plugin to the nodemailer transporter
        transport.use('compile', hbs(options));

        const mailOptions = {
            from: 'MSF-REACH <admin@msf-reach.org>', // sender address
            to: recipient,
            subject: 'Update your MSF-REACH contact details',
            template: 'fixme',
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
    })
});
