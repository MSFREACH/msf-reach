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

        let features = []; // store for features
        for (let i = 0; i < result.rss.channel[0].item.length; i++) {
          let event = result.rss.channel[0].item[i];
          //console.log(event);
          if (event["georss:point"]) {
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
            feature.properties["updated"] = event.pubDate[0];
            feature.properties["id"] = event.guid[0]._;
            feature.properties["type"] = event["gdacs:eventtype"][0];
            feature.properties["level"] = event["gdacs:alertlevel"][0].toLowerCase();
            feature.properties["summary"] = event.description[0].trim();

            // push feature to feature collection
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
