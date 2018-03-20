/*eslint no-unused-vars: off*/

var healthsitesLayer;

/**
* Function to map data from healthsites.io
* @param {Object} sites - GeoJSON Object containing site details
*/
var mapHealthSites = function(err, healthsites) {

    // Add popups
    function onEachFeature(feature, layer) {
        var popupContent = 'Type: ' + (feature.properties.hasOwnProperty('type') ? feature.properties.type : feature.properties.nature-of-facility) + '<br />' +
            'Name: ' + feature.properties.name + '<br />' +
            'Date modified: ' + feature.properties.name + '<br />' +
            'Source: <a href="' + feature.properties.source_url + '">'+feature.properties.source+'</a><br />';

        layer.bindPopup(popupContent);
    }

    if (healthsitesLayer)
    {
        computerTriggered=true;
        mainMap.removeLayer(healthsitesLayer);
        layerControl.removeLayer(healthsitesLayer);
        computerTriggered=false;
    }




    healthsitesLayer = L.markerClusterGroup({
        maxClusterRadius:MAX_RADIUS,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();

            return new L.DivIcon({ html: '<div><span style="color:white;"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-healthsites' , iconSize: new L.Point(40, 40) });

        }
    }
    ).addLayer(L.geoJSON(healthsites, {
        pointToLayer: function (feature, latlng) {

            return L.marker(latlng, {icon: L.icon({
                iconUrl: '/resources/images/icons/pin.svg',
                iconSize:     [35, 35], // size of the icon
                popupAnchor: [0, -10]
                //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
                //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
            })});
        },
        onEachFeature: onEachFeature
    }));


    if (Cookies.get('Health Sites')==='on') {
        healthsitesLayer.addTo(mainMap);
    }
    layerControl.addOverlay(healthsitesLayer, 'Health Sites');

};



var getHealthSites = function(latlngbounds, callback){
    var minLng = latlngbounds.getWest(), maxLng = latlngbounds.getEast();
    var minLat = latlngbounds.getSouth(), maxLat = latlngbounds.getNorth();
    var extents = 'extent=' + String(minLng) + ',' + String(minLat) + ',' + String(maxLng) + ','+ String(maxLat);
    if (typeof(country)!=='undefined' && country !== '') {
        q = '&country='+country;
    }
    var doneGettingSites = false, page = 1;
    var sitesFeatures = {
        'type': 'FeatureCollection',
        'features': []
    };
    var deferreds = [];
    for (page = 1; page < 5; page++) {
        deferreds.push(
            $.getJSON('/api/proxy/https://healthsites.io/api/v1/healthsites/facilities?'+extents+'&format=' + GEOFORMAT + '&page='+String(page), function ( data ){
                if (!data.features.length==0) {
                    sitesFeatures.features = sitesFeatures.features.concat(data.features);
                }
            })); // todo: add a fail case back in
    }
    $.when.apply(null, deferreds).done(function() {
        callback(null, sitesFeatures);
    });

};
