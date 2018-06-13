import Promise from 'bluebird';
import rp from 'request-promise';

// Take LRA Crisis Tracker json and return geojson with required properties.

const LRA = () =>
    new Promise((resolve, reject) => {
        var options = {
            uri: 'https://www.lracrisistracker.com//map.json?&attack_type=all_attacks&duration=month&request_type=max_records&primary_actors=LRA&start_date=2018-01-01&verification_ratings=',
            json: true
        };

        rp(options)
            .then(function(result) {
                let features = []; // store for features

                for (let i = 0; i < result.points.length; i++) {
                    let event = result.points[i];

                    let feature = {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [] },
                        properties: {}
                    };
                        // extract coords
                    feature.geometry.coordinates.push(event.longitude);
                    feature.geometry.coordinates.push(event.latitude);

                    // extract properties
                    feature.properties.source = 'LRA Crisis Tracker';
                    feature.properties.title = event.community_name;
                    feature.properties.link = 'https://www.lracrisistracker.com/incidents/'+event.id;
                    feature.properties.start_date = event.start_date;
                    feature.properties.id = event.id;
                    feature.properties.lra_verification_rating = event.lra_verification_rating;
                    feature.properties.summary = event.public_display_note;

                    // push feature to feature collection
                    features.push(feature);

                }
                // return GeoJSON
                resolve({ type: 'FeatureCollection', title: 'LRA Crisis Tracker', features: features });
            })
            .catch(function(err) {
                reject(err);
            });
    });

module.exports = { LRA };
