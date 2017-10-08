import Promise from "bluebird";

import { parseString } from "xml2js";
import rp from "request-promise";

const avalanche = () =>
  new Promise((resolve, reject) => {
    var options = {
      uri: "https://www.sierraavalanchecenter.org/observations-rss.xml",
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
        let title = result.rss.channel[0].title[0];
        let features = []; // store for features

        for (var i = 0; i < result.rss.channel[0].item.length; i++) {
          var event=result.rss.channel[0].item[i];
          let feature = {"type": "Feature", "geometry":{"type":"Point","coordinates":[]},"properties":{}};

          // hardcode general area for now
          feature.geometry.coordinates = [-119.9469707, 39.28565];
          /*
           * have to put in separately later by parsing
           * the HTML from each item's link
           */


          // extract properties
          feature.properties["title"] = event.title[0];
          feature.properties["link"] = event.link[0];
          feature.properties["updated"] = event.pubDate[0];
          feature.properties["id"] = "avalanche-" + event.guid[0]._.split(' ')[0];
          feature.properties["summary"] = event.description[0];

          // push feature to feature collection
          features.push(feature);


        }
        // return GeoJSON
        resolve({ type: "FeatureCollection", title: title, features: features });
      })
      .catch(function(err) {
        console.log("Error", err);
      });
  });

module.exports = { avalanche };
