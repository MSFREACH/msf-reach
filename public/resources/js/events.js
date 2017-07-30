/**
 * Events page script
 * @file public/resources/js/events.js
 * Display and interact with event objects from events page
 */

// Constants
 GEOFORMAT = 'geojson'; // Change to topojson for prod
 WEB_HOST = 'https://msf-reach.org/'; // Change to host for prod
 EVENT_PROPERTIES = ['id', 'status', 'type', 'created'];

// Globals
var currentEventId;

var zoomToEvent = function(latlng){
  eventsMap.setView(latlng, 12);
}

/**
  * Function to print a list of event details to web page
  * @param {Object} eventProperties - Object containing event details
  */
var printEventProperties = function(err, eventProperties){
  // If called with err, print that instead
  if (err){
    $('#eventProperties').append(err);
  } else {
    // Loop through properties and create a HTML list
    var propertiesTable = "";
    propertiesTable += '<table class="table">'
    $.each( eventProperties, function( key, val ) {
      if (EVENT_PROPERTIES.indexOf(key) > -1 ){
        propertiesTable += "<tr id='" + key + "'><td>" + key.charAt(0).toUpperCase()+key.slice(1) + "</td><td>"
                              + val + "</td></tr>" ;
      }
    });
    // Create unique link to this event
    var eventLink = WEB_HOST + 'events/?eventId=' + eventProperties.id;
    // Create unique report link for this event
    var eventReportLink = WEB_HOST + 'report/?eventId=' + eventProperties.id + '&reportkey=' + eventProperties.reportkey
    // Add unique link to this event
    propertiesTable += "<tr><td>Event link</td><td><a href='"+eventLink+"'>"+eventLink+"</a></td></tr>";
    // Add unique link to report to this event
    propertiesTable += "<tr><td>Report link</td><td><a href='"+eventReportLink+"'>"+eventReportLink+"</a></td></tr>";
    $("#eventProperties").append('<p>Report link: <a href=' + eventReportLink + '>'+eventReportLink+'</a></p>');
    // Append output to body
    propertiesTable += "</table>"
    $("#eventProperties").html(propertiesTable);

    //$('#title').append(' ' + eventProperties.id);
  }
}

/**
  * Function to get event details from API
  * @param {Number} eventId - Unique event ID to fetch
  * @param {Function} callback - Function to call once data returned
  * @returns {String} err - Error message if any, else none
  * @returns {Object} eventProperties - Event properties unless error
  */
var getEvent = function(eventId, callback){
  $.getJSON('/api/events/' + eventId + '?geoformat=' + GEOFORMAT, function ( data ){
    // Zoom to location
    zoomToEvent([data.result.features[0].geometry.coordinates[1],data.result.features[0].geometry.coordinates[0]])
    // Print output to page
    callback(null, data.result.features[0].properties);
  }).fail(function(err) {
    // Catch condition where no data returned
    callback(err.responseText, null);
  })
}

/**
  * Function to get reports for an event
  * @param {Number} eventId - UniqueId of event
  **/
var getReports = function(eventId, callback){
  $.getJSON('/api/reports/?eventId=' + eventId + '&GEOFORMAT=' + GEOFORMAT, function( data ){
    callback(data.result);
  });
};

/**
  * Function to add reports to map
  * @param {Object} reports - GeoJson FeatureCollection containing report points
  **/
var mapReports = function(reports){
  var reportsMarker = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  L.geoJSON(reports, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, reportsMarker);
    }
}).addTo(eventsMap);
}

// Main function (effective)
// Get eventId from URL
currentEventId = getQueryVariable("eventId");
// Only ask API where event is specified and not empty
if (currentEventId !== false && currentEventId != ''){
  getEvent(currentEventId, printEventProperties);
  getReports(currentEventId, mapReports);
} else {
  // Catch condition where no event specified, print to screen
  printEventProperties('No event ID specified', null)
}

// Create map
var eventsMap = L.map('map').setView([-6.8, 108.7], 7);

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
}).addTo(eventsMap);

var baseMaps = {
  "Terrain": stamenTerrain,
  "Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(eventsMap);

// Archive support
$('#btnArchive').click(function(e){

  var body = {
    "status":"inactive",
    "metadata":{}
  }

  $.ajax({
    type: "POST",
    url: "/api/events/" + currentEventId,
    data: JSON.stringify(body),
    contentType: 'application/json'
  }).done(function( data, textStatus, req ){
    window.location.href = '/';
  }).fail(function (reqm, textStatus, err){
    alert(err);
  });
})
