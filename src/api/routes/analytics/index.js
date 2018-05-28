
import { Router } from 'express';
import rp from 'request-promise';


// Import any required utility functions
import { ensureAuthenticated } from '../../../lib/util';



// Import validation dependencies

import { celebrate as validate , Joi} from 'celebrate';



export default ({ config, logger }) => {
    let api = Router();

    // Get a list of all tweets matching the searchString
    api.post('/analyze', ensureAuthenticated,
        validate({
            body: Joi.object().required()
        }),
        (req, res, next) => {
            let eventBody=req.body;
            let options = {
                method: 'POST',
                uri: 'https://msf-api.vizalytics.com/event',
                body: eventBody  /*{
                    'metadata': {
                        'severity': 'quite severe',
                        'population_total': 1000000,
                        'operational_center': 'OCA',
                        'incharge_name': 'Dr. Place Holder',
                        'severity_scale': 2,
                        'exploratory_details': 'Some situational details',
                        'incharge_position': 'Area Leader',
                        'security_details': 'Safe in town',
                        'capacity': 'No external medical capacity on the ground',
                        'non_medical_materials': [
                            {
                                'type': 'non-medical kit',
                                'quantity': 1200
                            },
                            {
                                'type': 'meal kit',
                                'quantity': 500
                            }
                        ],
                        'medical_materials': [
                            {
                                'type': 'medical kit',
                                'quantity': 5
                            },
                            {
                                'type': 'immunizations for something',
                                'quantity': 1000
                            }
                        ],
                        'population_affected': 1000,
                        'sharepoint_link': 'http://sharepoint.site/path/',
                        'sub_type': 'medical',
                        'event_datetime': '2018-04-20T09:59:30.000Z',
                        'name': 'Example event',
                        'bounds': [ [ 104.645, 10.023 ], [ 105.765, 8.646 ] ],
                        'user': 'Ms. Event Enterer',
                        'event_status': 'monitoring',
                        'other_orgs': 'Local Community Health Center',
                        'deployment': 'MSF immunisation specialists deployed'
                    },
                    'created_at': '2018-04-20T10:00:00.000Z',
                    'location': [ 105.194, 9.330 ],
                    'type': 'armed_conflict',
                    'status': 'active'
                }*/,
                headers: {
                    'x-api-key': config.VIZALYTICS_API_KEY,
                    'content-type': 'application/json'
                },
                json: true // Automatically stringifies the body to JSON
            };

            rp(options)
                .then(function (parsedBody) {
                    res.status(200).send(parsedBody);
                }).catch((err) => {
                /* istanbul ignore next */
                    logger.error(err);
                    /* istanbul ignore next */
                    next(err);
                });
        });

    return api;
};
