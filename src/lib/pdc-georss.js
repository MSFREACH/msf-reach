import Promise from 'bluebird';

import {parseString} from 'xml2js';
import http from 'http';

const PDC = () => new Promise((resolve, reject) => {
  // GET PDC feed
  http.get({
    host: 'd2mxabrykbl1km.cloudfront.net',
    path: '/feed.xml'
  }, function(response){
    // Append to body object
    let body = '';
    response.on('data', function(d){
      body += d;
    });
    // Pass completed response to
    response.on('end', function(){
      parseString(body, function(err, result){

        if (err) reject(err); // handle errors

        let features = []; // store for features
        for (let i = 0; i < result.feed.entry.length; i++){
          let event = result.feed.entry[i];
          if (event['georss:point']){
            // define a feature
            let feature = {"type": "Feature", "geometry":{"type":"Point","coordinates":[]},"properties":{}};
            // extract coords
            let coords = event['georss:point'][0].split(" ");
            feature.geometry.coordinates.push(JSON.parse(coords[1]));
            feature.geometry.coordinates.push(JSON.parse(coords[0]));
            // extract properties
            feature.properties["source"] = "Pacific Disaster Center";
            feature.properties["title"] = event.title[0];
            feature.properties["link"] = event.link[0]['$']['href'];
            feature.properties["id"] = "PDC-"+event.id[0];
            feature.properties["updated"] = event.updated[0];
            feature.properties["summary"] = event.summary[0];
            // push feature to feature collection
            features.push(feature);
          }
        }
        // return GeoJSON
        resolve({"type":"FeatureCollection","features":features});
      });
    })
  })


})

module.exports = {PDC}
