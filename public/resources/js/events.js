/**
 * Events page script
 * @file public/resources/js/events.js
 * Display and interact with event objects from events page
 */

// Constants
var GEOFORMAT = 'geojson'; // Change to topojson for prod
var WEB_HOST = 'https://msf-reach.org/'; // Change to host for prod
var EVENT_PROPERTIES = ['id', 'status', 'type', 'created'];

// Globals
var currentEventId;

var zoomToEvent = function(latlng){
  eventsMap.setView(latlng, 12);
}

var clipboard = new Clipboard('.btn');
clipboard.on('success', function(e) {
    console.log(e);
});
clipboard.on('error', function(e) {
    console.log(e);
});

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
                              + val + "</td><td></td></tr>" ;
      }
    });
    // Create unique link to this event
    var eventLink = WEB_HOST + 'events/?eventId=' + eventProperties.id;
    // Create unique report link for this event
    var eventReportLink = WEB_HOST + 'report/?eventId=' + eventProperties.id + '&reportkey=' + eventProperties.reportkey;
    // Add unique link to this event
    propertiesTable += "<tr><td>Event link</td><td><a id='eventLink'  href='"+eventLink+"'>"+eventLink+"</a></td><td><button class='btn btn-primary  ' data-clipboard-target='#eventLink'>Copy</button></td></tr>";
    // Add unique link to report to this event
    propertiesTable += "<tr><td>Report link</td><td><a id='reportLink' href='"+eventReportLink+"'>"+eventReportLink+"</a></td><td><button class='btn btn-primary' data-clipboard-target='#reportLink'>Copy</button></td></tr>";
    // Add user metadata
    if (eventProperties.metadata.user){
      propertiesTable += "<tr><td>Owner</td><td>"+eventProperties.metadata.user+"</td></tr>"
    }
    if (eventProperties.metadata.user_edit){
      propertiesTable += "<tr><td>Edits</td><td>"+eventProperties.metadata.user_edit+"</td></tr>"
    }

    // Pre-fil edit modal
    $('#inputSummary').val(eventProperties.metadata.summary);
    $('#inputPracticalDetails').val(eventProperties.metadata.practical_details);
    $('#inputSecurityDetails').val(eventProperties.metadata.security_details);


    // Append output to body
    propertiesTable += "</table>"
    $("#eventProperties").html(propertiesTable);

    console.log(eventProperties);
    $("#eventSummary").append(eventProperties.metadata.summary);
    $("#eventPracticalDetails").append(eventProperties.metadata.practical_details);
    $("#eventSecurityDetails").append(eventProperties.metadata.security_details);
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
  $.getJSON('/api/reports/?eventId=' + eventId + '&geoformat=' + GEOFORMAT, function( data ){
    callback(data.result);
  });
};

/**
  * Function to add reports to map
  * @param {Object} reports - GeoJson FeatureCollection containing report points
  **/
var mapReports = function(reports){

  function onEachFeature(feature, layer) {
     //var popupContent = "<strong><a href='events/?eventId=" + feature.properties.id + "'>Event " + feature.properties.id +"</a></strong>" + "<BR>Status: " + feature.properties.status +"<BR>Type: " + feature.properties.type +"<BR>Created: " + feature.properties.created;

     var popupContent = '';

     if (feature.properties && feature.properties.content) {
       popupContent += feature.properties.content.text;
     }

     layer.bindPopup(popupContent);
   }

  var reportsMarker = L.divIcon({className: 'report-icon', html: '<span class="glyphicon glyphicon-info-sign"></span>'});

  L.geoJSON(reports, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: reportsMarker});
    },
    onEachFeature: onEachFeature
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
    type: "PUT",
    url: "/api/events/" + currentEventId,
    data: JSON.stringify(body),
    contentType: 'application/json'
  }).done(function( data, textStatus, req ){
    window.location.href = '/';
  }).fail(function (reqm, textStatus, err){
    alert(err);
  });
});

// Edit support
$('#btnSaveEdits').click(function(e){

  var body = {
    "status":"active",
    "metadata":{
      "summary": $("#inputSummary").val(),
      "practical_details": $("#inputPracticalDetails").val(),
      "security_details": $("#inputSecurityDetails").val(),
      "user_edit": localStorage.getItem("username")
    }
  }

  $.ajax({
    type: "PUT",
    url: "/api/events/" + currentEventId,
    data: JSON.stringify(body),
    contentType: 'application/json'
  }).done(function( data, textStatus, req ){
    //$('#editModal').modal('toggle'); // toggling doesn't refresh data on page.
    window.location.href = '/events/?eventId=' + currentEventId;
  }).fail(function (reqm, textStatus, err){
    alert(err);
  });
});
