import Promise from 'bluebird';

import {parseString} from 'xml2js';

const GeoRSS = () => new Promise((resolve, reject) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?><feed  xmlns="http://www.w3.org/2005/Atom" xmlns:georss="http://www.georss.org/georss"><title>World Natural Hazards Website | Natural Disaster Management | Disaster Agency Hawaii - PDC</title><link href="http://pdc.org/" rel="self"/><updated>2017-08-04T01:41:33-10:00</updated><author><name>PDC</name><uri>http://pdc.org/</uri></author><id>tag:pdc.org,2013:1</id><entry><title>Earthquake - 5.1 - 55km WNW of Ishigaki, Japan</title><link href="http://snc.pdc.org/PRODUCTION/aaa6f175-783c-4d6c-83cf-733dbab2de25/index.html" /><id>tag:pdc.org,2013:1.71833</id><updated>2017-08-04T01:41:33-10:00</updated><summary>EARTHQUAKE (ADVISORY)</summary><georss:point>24.5711002 123.6700974</georss:point></entry><entry><title>Earthquake - 5.1 - 55km WNW of Ishigaki, Japan</title><link href="http://snc.pdc.org/PRODUCTION/aaa6f175-783c-4d6c-83cf-733dbab2de25/index.html" /><id>tag:pdc.org,2013:1.71833</id><updated>2017-08-04T01:41:33-10:00</updated><summary>EARTHQUAKE (ADVISORY)</summary><georss:point>24.5711002 123.6700974</georss:point></entry></feed></xml>'

  parseString(xml, function(err, result){

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
        feature.properties["title"] = event.title[0];
        feature.properties["link"] = event.link[0]['$']['href'];
        feature.properties["id"] = event.id[0];
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

module.exports = {GeoRSS}
