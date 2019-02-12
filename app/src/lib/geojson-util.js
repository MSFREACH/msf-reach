
function getFeatures(topoJson, key) {
    return topoJson.objects[key].geometries.map(function(geom) {
        return {
            type: 'Feature',
            id: geom.properties.id,
            properties: geom.properties || {},
            geometry: {
                type: geom.type,
                coordinates: geom.coordinates
            }
        };
    });
}


function getFeaturesFromArcs(topoJson, key){
    return topoJson.objects[key].geometries.map(function(geom, index) {
        return {
            type: 'Feature',
            properties: geom.properties || {},
            geometry: {
                type: geom.type,
                coordinates: [topoJson.arcs[index]] // **** topoJSON stores polygon points in arcs
            }
        };
    });
}


module.exports = {
    getFeatures, getFeaturesFromArcs
};
