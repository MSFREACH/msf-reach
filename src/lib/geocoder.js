
import config from '../config';

import request from 'request';

module.exports.geocode = function (body, query, values, callback)
{
  console.log('running geocoder');
  if (config.GOOGLE_API_KEY) {
    request('https://maps.googleapis.com/maps/api/geocode/json?latlng='+String(body.location.lat)+','+String(body.location.lng)+'&key='+config.GOOGLE_API_KEY, function (error, response, response_body) {
      if (error) {
        console.log('err ' + err );
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        body.metadata.country = 'unknown'
        callback(query,values);
      } else {
        console.log('got here');
        body.metadata.country = 'unknown';
        let geocoded = JSON.parse(response_body);
        console.log(geocoded.results[0].address_components);
        for (let i = 0; i < geocoded.results[0].address_components.length; i++ ) {
          if (geocoded.results[0].address_components[i].types.indexOf('country') > -1) {
            body.metadata.country=geocoded.results[0].address_components[i].long_name;
          }
        }
        console.log(body.metadata);
        callback(query,values);
      }
    });
  }
};
