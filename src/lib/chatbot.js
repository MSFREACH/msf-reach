import config from '../config';
var Promise = require('bluebird');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda({apiVersion: '2015-03-31', region: 'us-east-1'});

module.exports.addChatbotItem = (data,id,body,reportUrl) => new Promise((resolve, reject) =>
{
    if (typeof(body.metadata)!=='undefined' && name in body.metadata) {
        let keywords = name.split('_');
        // set up the lambda event to pass on the bot handler lambda:
        var event = {
            'Command': 'ADD',
            'Body': [
                {
                    'qid': id,
                    'q': keywords,
                    'a':'Please submit a report for the event ' + keywords.join(' ') + ' [report link]('+reportUrl+')',
                    'r':
            {'title':'','imageUrl':''}
                }
            ]
        };
        var addParams = {
            FunctionName: config.BOT_HANDLER_ARN, /* required */
            ClientContext: 'msf-reach-server',
            InvocationType: 'Event',
            Payload: JSON.stringify(event) /* Strings will be Base-64 encoded on your behalf */,
        };
        var buildParams = {
            FunctionName: config.BOT_HANDLER_ARN, /* required */
            ClientContext: 'msf-reach-server',
            InvocationType: 'Event',
            Payload: JSON.stringify({'Command':'BUILD'})
        };
        if (config.BOT_HANDLER_ARN) {
            lambda.invoke(addParams, function(err, data) { // eslint-disable-line no-unused-vars
                if (err) {
                    reject(err);
                }
                else lambda.invoke(buildParams, function(err, data) { // eslint-disable-line no-unused-vars
                    if (err) {
                        reject(err);
                    }
                });
            });
            //  .then(lambda.invoke(buildParams).promise().catch(function (err) {
            //    console.log(err)})).catch(function(err){console.log(err)})
        }
    }
    resolve(data);

});
