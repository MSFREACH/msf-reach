/**
 * Landing page script
 * @file public/resources/js/landing.js
 * Show overview of MSF Reach events
 */

// Constants
GEOFORMAT='geojson';
HOSTNAME='http://localhost:8001/'

 /**
   * Function to get all events from the API
   * @param {Function} callback - Function to call once data returned
   * @returns {String} err - Error message if any, else none
   * @returns {Object} events - Events as GeoJSON FeatureCollection
   */
 var getAllEvents = function(callback){
   $.getJSON('/api/events/?geoformat=' + GEOFORMAT, function ( data ){
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

 /**
   * Function to print a table of events
   * @param {Object} events - GeoJSON Object containing event details
   */
 var mapAllEvents = function(err, events){
   // If called with err, print that instead
   if (err){
     console.log( 'Error: ' + err );
   } else {
     L.geoJSON(events, {
       pointToLayer: function(feature, latlng){
         return L.marker(latlng);
       },
       onEachFeature: onEachFeature
     }).addTo(landingMap);
   }
 }

// Create map
var landingMap = L.map('landingMap').setView([-6.8, 108.7], 7);

getAllEvents(mapAllEvents);

// Add some base tiles
var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
}).addTo(landingMap);
