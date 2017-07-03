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

 /**
   * Function to print a table of events
   * @param {Object} events - GeoJSON Object containing event details
   */
 var printAllEvents = function(err, events){
   // If called with err, print that instead
   if (err){
     $('#eventsList').append(err);
   } else {
     // Construct a bootstrap table
     var eventsTable = '<table class="table table-hover table-bordered">';
     eventsTable += '<tr><th>Event</th>'
     eventsTable += '<th>Status</th>'
     eventsTable += '<th>Type</th></tr>'
     // Loop through properties and create a HTML list
     for (var i = 0; i < events.features.length; i++){
         eventsTable += "<tr><td><a href="+HOSTNAME+"events/?eventId="+events.features[i].properties.id+">" + events.features[i].properties.id + "</a></td>";
         eventsTable += '<td>' + events.features[i].properties.status + "</td>";
         eventsTable += '<td>' + events.features[i].properties.type + "</td></a></tr>";
     };
     eventsTable += '</table>'
     // Append output to table
    $('#eventsTable').append(eventsTable);
   }
 }

getAllEvents(printAllEvents);

// Create map
var landingMap = L.map('landingMap').setView([-6.8, 108.7], 7);

// Add some base tiles
var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
}).addTo(landingMap);
