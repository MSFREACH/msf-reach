/**
 * Landing page script
 * @file public/resources/js/landing.js
 * Show overview of MSF Reach events
 */

// Constants
GEOFORMAT='geojson';
HOSTNAME='http://localhost:8001/';
TYPES=['earthquake', 'flood', 'conflict'];

 /**
   * Function to get all events from the API
   * @param {Function} callback - Function to call once data returned
   * @returns {String} err - Error message if any, else none
   * @returns {Object} events - Events as GeoJSON FeatureCollection
   */
 var getAllEvents = function(callback){
   $.getJSON('/api/events/?status=active&geoformat=' + GEOFORMAT, function ( data ){
     // Print output to page
     callback(null, data.result);
   }).fail(function(err) {
     // Catch condition where no data returned
     callback(err.responseText, null);
   })
 };

// Add popups
 function onEachFeature(feature, layer) {
 		var popupContent = "<strong><a href='events/?eventId=" + feature.properties.id + "'>Event " + feature.properties.id +"</a></strong>" + "<BR>Status: " + feature.properties.status +"<BR>Type: " + feature.properties.type +"<BR>Created: " + feature.properties.created;

 		if (feature.properties && feature.properties.popupContent) {
 			popupContent += feature.properties.popupContent;
 		}

 		layer.bindPopup(popupContent);
 	}

  // MSF Icons
  var msfIcon = L.icon({
    iconUrl: '/resources/images/msf_icon.png',

    iconSize:     [26, 26], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
});

 /**
   * Function to print a table of events
   * @param {Object} events - GeoJSON Object containing event details
   */
 var mapAllEvents = function(err, events){
   // If called with err, log that instead
   if (err){
     console.log( 'Error: ' + err );
   } else {
     for (var i = 0; i < TYPES.length; i++){
       console.log([TYPES[i]]);
       var layer = L.geoJSON(events, {
         pointToLayer: function(feature, latlng){
                return L.marker(latlng, {icon: msfIcon});
              },
        onEachFeature: onEachFeature,
        filter: function(feature, layer){
          if (feature.properties.type === TYPES[i]){
            return feature;
          }
        }})
        layer.addTo(landingMap);
        layerControl.addOverlay(layer, TYPES[i]);
      };
     }
     /*var eventsLayer = L.geoJSON(events, {
       pointToLayer: function(feature, latlng){
         return L.marker(latlng);
       },
       onEachFeature: onEachFeature
     });*/
     //eventsLayer.addTo(landingMap);
 }

// Create map
var landingMap = L.map('landingMap').setView([-6.8, 108.7], 7);

// Add some base tiles
var stamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
  attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
}).addTo(landingMap);

var baseMaps = {
  "Terrain": stamenTerrain,
  "Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(landingMap);

getAllEvents(mapAllEvents);
