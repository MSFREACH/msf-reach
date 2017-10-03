import Promise from "bluebird";

import { parseString } from "xml2js";
import rp from "request-promise";

const GDACS = () =>
  new Promise((resolve, reject) => {
    var options = {
      uri: "http://gdacs.org/xml/rss_homepage.xml",
      transform: function(body) {
        return new Promise(resolve => {
          parseString(body, function(err, result) {
            if (err) result(err); // handle errors
            resolve(result);
          });
        });
      }
    };

    rp(options)
      .then(function(result) {
        let title = result.rss.channel.title;
        console.log(result.rss.channel[0]);
        let features = []; // store for features
        for (let i = 0; i < result.rss.channel[0].item.length; i++) {
          let event = result.rss.channel[0].item[i];
          //console.log(event);
          if (event["georss:point"]) {
            console.log(event);
            // define a feature
            let feature = {
              type: "Feature",
              geometry: { type: "Point", coordinates: [] },
              properties: {}
            };
            // extract coords
            let coords = event['georss:point'][0].split(" ");

            feature.geometry.coordinates.push(JSON.parse(coords[1]));
            feature.geometry.coordinates.push(JSON.parse(coords[0]));
            // extract properties
            feature.properties["title"] = event.title[0];
            feature.properties["link"] = event.link[0];
            feature.properties["id"] = event["gdacs:eventid"][0];
            feature.properties["fromdate"] = event["gdacs:fromdate"][0];
            feature.properties["todate"] = event["gdacs:todate"][0];
            feature.properties["summary"] = event.description[0].trim();

            // push feature to feature collection
            console.log(feature)
            features.push(feature);

          }
        }
        // return GeoJSON
        resolve({ type: "FeatureCollection", title: title, features: features });
      })
      .catch(function(err) {
        console.log("Error", err);
      });
  });

module.exports = { GDACS };
