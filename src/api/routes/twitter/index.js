import Promise from 'bluebird';

import { Router } from 'express';

// Import any required utility functions
import { cacheResponse, ensureAuthenticated } from '../../../lib/util';

import { searchTwitter, embedTweet } from '../../../lib/twitter.js';

// Import validation dependencies

import { celebrate as validate , Joi } from 'celebrate';

export default ({ logger }) => {
    let api = Router();

    // Get a list of all tweets matching the searchString
    api.get('/', ensureAuthenticated, cacheResponse('1 minute'),
        validate({
            query: {
                searchString: Joi.string().required(),
                max_id: Joi.string().allow('') /// current id string
            }
        }),
        (req, res, next) => searchTwitter(req.query.searchString, req.query.max_id)
            .then((data) => {
                let promiseArray = [];
                /// here should get a new id string
                if(data.statuses && data.statuses.length > 0){
                    var lastId = data.statuses[data.statuses.length-1].id; // also the oldest one, so working backwards
                    // console.log('routes/twitter/index.js ------ new IDStr____ ',lastId)

                }

                for (var i = 0; i < data.statuses.length; i++) {
                    promiseArray.push(embedTweet(data.statuses[i].id_str, 'https://twitter.com/'+data.statuses[i].user.screen_name+'/status/'+data.statuses[i].id_str));
                }
                Promise.all(promiseArray).then(function(resultArray) {
                    res.status(200).json({statusCode: 200, result:resultArray, lastId: lastId});
                });
                //.then((result) => res.status(200).json({ statusCode: 200, result: result }))

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
