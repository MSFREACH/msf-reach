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
var eventReportLink;
var currentEventProperties;

var zoomToEvent = function(latlng) {
  eventsMap.setView(latlng, 12);
};

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

  // Make a global store of current event properties
  currentEventProperties = eventProperties;

  // Add to Twitter search "AI"
  $(document).ready(function(){
    $('#searchTerm').val(currentEventProperties.metadata.name);
    $('#btnSearchTwitter').trigger('click');

    $("#searchTerm").keyup(function(event){
      if(event.keyCode == 13){
        $('#btnSearchTwitter').trigger('click');
      }
    });

  });

  // If called with err, print that instead
  if (err){
    $('#eventProperties').append(err);
  } else {
    // Loop through properties and create a HTML list
    var propertiesTable = "";
    propertiesTable += '<table class="table">';
    $.each( eventProperties, function( key, val ) {
      if (EVENT_PROPERTIES.indexOf(key) > -1 ){
        propertiesTable += "<tr id='" + key + "'><td>" + key.charAt(0).toUpperCase()+key.slice(1) + "</td><td>" +
        val + "</td><td></td></tr>" ;
      }
    });
    // Create unique link to this event
    var eventLink = WEB_HOST + 'events/?eventId=' + eventProperties.id;
    // Create unique report link for this event
    eventReportLink = WEB_HOST + 'report/?eventId=' + eventProperties.id + '&reportkey=' + eventProperties.reportkey;
    // Add unique link to this event
    propertiesTable += "<tr><td>Event link</td><td><a id='eventLink'  href='"+eventLink+"' target='_blank'>"+eventLink+"</a></td><td><button class='btn btn-primary  ' data-clipboard-target='#eventLink'>Copy</button></td></tr>";
    // Add unique link to report to this event
    propertiesTable += "<tr><td>Report link</td><td><a id='reportLink' href='"+eventReportLink+"' target='_blank'>"+eventReportLink+"</a></td><td><button class='btn btn-primary' data-clipboard-target='#reportLink'>Copy</button></td></tr>";
    // Add user metadata
    if (eventProperties.metadata.user) {
      propertiesTable += "<tr><td>Owner</td><td>"+eventProperties.metadata.user+"</td></tr>";
    }
    if (eventProperties.metadata.user_edit) {
      propertiesTable += "<tr><td>Edits</td><td>"+eventProperties.metadata.user_edit+"</td></tr>";
    }

    // Pre-fil edit modal
    $('#inputName').val(eventProperties.metadata.name);
    $('#inputSummary').val(eventProperties.metadata.summary);
    $('#inputPracticalDetails').val(eventProperties.metadata.practical_details);
    $('#inputSecurityDetails').val(eventProperties.metadata.security_details);

    // Append output to body
    propertiesTable += "</table>";
    $("#eventProperties").html(propertiesTable);

    console.log(eventProperties);
    $("#eventSummary").append(eventProperties.metadata.summary);
    $("#eventPracticalDetails").append(eventProperties.metadata.practical_details);
    $("#eventSecurityDetails").append(eventProperties.metadata.security_details);

   $("#eventBasicInfo").append("<dt>Name: </dt><dd>"+eventProperties.metadata.name+"</dd>");
   $("#eventBasicInfo").append("<dt>Sub Type: </dt><dd>"+eventProperties.metadata.sub_type+"</dd>");
   $("#eventBasicInfo").append("<dt>Event Status </dt><dd>"+eventProperties.metadata.event_status+"</dd>");
   $("#eventBasicInfo").append("<dt>Person In charge </dt><dd>"+eventProperties.metadata.incharge_name+', '+eventProperties.metadata.incharge_position+"</dd>");
   $("#eventBasicInfo").append("<dt>Severity </dt><dd>"+eventProperties.metadata.severity+"</dd>");
   $("#eventBasicInfo").append("<dt>Sharepoint Link </dt><dd>"+eventProperties.metadata.sharepoint_link+"</dd>");



    $("#eventExtra").append("<dt>Exploratory details</dt><dd>"+eventProperties.metadata.exploratory_details+"</dd>");
    $("#eventExtra").append("<dt>Operational Center</dt><dd>"+eventProperties.metadata.operational_center+"</dd>");
    $("#eventExtra").append("<dt>Other organisations</dt><dd>"+eventProperties.metadata.other_orgs+"</dd>");
    $("#eventExtra").append("<dt>Deployment details</dt><dd>"+eventProperties.metadata.deployment+"</dd>");
    $("#eventExtra").append("<dt>Capacity </dt><dd>"+eventProperties.metadata.capacity+"</dd>");
    $("#eventExtra").append("<dt>Medical Materials</dt><dd>"+eventProperties.metadata.medicalMaterials+"</dd>");
    $("#eventExtra").append("<dt>Nonmedical Materials </dt><dd>"+eventProperties.metadata.nonMedicalMaterials+"</dd>");
    $("#eventExtra").append("<dt>Total population</dt><dd>"+eventProperties.metadata.population_total+"</dd>");
    $("#eventExtra").append("<dt>Affected population</dt><dd>"+eventProperties.metadata.population_affected+"</dd>");

  }
  if (currentEventProperties.metadata.saved_tweets && currentEventProperties.metadata.saved_tweets.length > 0) {
    $.each(currentEventProperties.metadata.saved_tweets, function(key, value){
      console.log(value.html);
      $('#savedTweets').prepend('<div id="'+value.tweetId+'">'+value.html+'</div>');
      var tweetEventReportLink = eventReportLink.replace("&", "%26");
      $('#'+value.tweetId).append('<a class="btn btn-primary" href="https://twitter.com/intent/tweet?in_reply_to='+value.tweetId+'&text=Please+send+further+information+'+tweetEventReportLink+'">Reply</a><hr>');
      twttr.widgets.load();
    });
  }
};

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
    zoomToEvent([data.result.features[0].geometry.coordinates[1],data.result.features[0].geometry.coordinates[0]]);
    // Print output to page
    callback(null, data.result.features[0].properties);
  }).fail(function(err) {
    // Catch condition where no data returned
    callback(err.responseText, null);
  });
};

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

    var popupContent = '';

    if (feature.properties && feature.properties.content) {
      popupContent += 'Decription: '+ feature.properties.content.description + '<BR>';
      popupContent += 'Tag: '+ feature.properties.content.report_tag + '<BR>';
      popupContent += 'Reporter: ' + feature.properties.content["username/alias"] + '<BR>';
      popupContent += 'Created: ' + feature.properties.created + '<BR>';
      if (feature.properties.content.image_link && feature.properties.content.image_link.length > 0){
        popupContent += '<img src="'+feature.properties.content.image_link+'" height="140">';
      }
    }

    layer.bindPopup(popupContent, {  maxWidth: "auto" });
  }

  var reportsMarker = L.divIcon({className: 'report-icon', html: '<span class="glyphicon glyphicon-info-sign"></span>'});

  // MSF Icons
  var reportsIcon = L.icon({
    iconUrl: '/resources/images/icons/reports/report_icon.svg',

    iconSize:     [60, 60], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

  var points = []; // local storage for coordinates of reports (used for map bounds)

  L.geoJSON(reports, {
    pointToLayer: function (feature, latlng) {
      points.push([latlng.lat, latlng.lng]);
      return L.marker(latlng, {icon: reportsIcon});
    },
    onEachFeature: onEachFeature
  }).addTo(eventsMap); // Add reports to map
  // Now that we have all reports, fit the map to their bounds
  if (points.length > 0){
    eventsMap.fitBounds(points);
  }
};

/**
* Function to add contacts to map
* @param {Object} contacts - GeoJson FeatureCollection containing contact points
**/
var mapContacts = function(contacts ){

  function onEachFeature(feature, layer) {

    var popupContent = '';

    if (feature.properties && feature.properties.properties) {
      popupContent += feature.properties.properties.name + '<BR>';
      popupContent += feature.properties.properties.type + '<BR>';
      popupContent += '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a><BR>';
      popupContent += feature.properties.properties.cell;
    }

    layer.bindPopup(popupContent);
  }

  // MSF Icons
  var contactIcon = L.icon({
    iconUrl: '/resources/images/icons/contacts/Contact_Red-42.svg',

    iconSize:     [36, 36], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

  var contactsLayer = L.geoJSON(contacts, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: contactIcon});
    },
    onEachFeature: onEachFeature
  });
  contactsLayer.addTo(eventsMap);
  layerControl.addOverlay(contactsLayer, 'Contacts');

};

/**
* Function to get contacts
**/
var getContacts = function(callback){
  $.getJSON('/api/contacts/?geoformat=' + GEOFORMAT, function( data ){
    callback(data.result);
  });
};

/**
* Function to get missions
**/
var getMissions = function(callback){
  $.getJSON('/api/missions/?geoformat=' + GEOFORMAT, function( data ){
    callback(data.result);
  });
};

/**
* Function to add missions to map
* @param {Object} missions - GeoJson FeatureCollection containing mission points
**/
var mapMissions = function(missions ){

  function onEachFeature(feature, layer) {

    var popupContent = '';

    if (feature.properties && feature.properties.properties) {
      popupContent += feature.properties.properties.type + '<BR>';
      popupContent += feature.properties.properties.name + '<BR>';
      popupContent += 'Start date: ' + feature.properties.properties.startDate + '<BR>';
      popupContent += 'Finish date: ' + feature.properties.properties.finishDate + '<BR>';
      popupContent += 'Managing OC: ' + feature.properties.properties.managingOC + '<BR>';
      popupContent += 'Severity: ' + feature.properties.properties.severity + '<BR>';
      popupContent += 'Capacity: ' + feature.properties.properties.capacity + '<BR>';
    }

    layer.bindPopup(popupContent);
  }

  // MSF Icons
  var missionIcon = L.icon({
    iconUrl: '/resources/images/icons/event_types/HISTORICAL-43.svg',

    iconSize:     [50, 50], // size of the icon
    opacity: 0.8
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

  var missionsLayer = L.geoJSON(missions, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: missionIcon});
    },
    onEachFeature: onEachFeature
  });
  missionsLayer.addTo(eventsMap);
  layerControl.addOverlay(missionsLayer, 'Mission Histories');
};


// Main function (effective)
// Get eventId from URL
currentEventId = getQueryVariable("eventId");
// Only ask API where event is specified and not empty
if (currentEventId !== false && currentEventId != ''){
  getEvent(currentEventId, printEventProperties);
  getReports(currentEventId, mapReports);
  getContacts(mapContacts);
  getMissions(mapMissions);
} else {
  // Catch condition where no event specified, print to screen
  printEventProperties('No event ID specified', null);
}

// Create map
var eventsMap = L.map('map').setView([-6.8, 108.7], 7);

// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/clgeros/cj2lgdo3x000b2rmrv6iiii38/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2xnZXJvcyIsImEiOiJjajBodHJjdGYwM21sMndwNHk2cGxxajRnIn0.nrw2cFsVqjA2bclnKs-9mw', {
  attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png'
});

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/clgeros/cj2lds8kl00042smtdpniowm2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2xnZXJvcyIsImEiOiJjajBodHJjdGYwM21sMndwNHk2cGxxajRnIn0.nrw2cFsVqjA2bclnKs-9mw', {
  attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
}).addTo(eventsMap);

var baseMaps = {
  "Terrain": mapboxTerrain,
  "Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(eventsMap);

// Archive support
$('#btnArchive').click(function(e){

  var body = {
    "status":"inactive",
    "metadata":{}
  };

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
      "name": $("#inputName").val(),
      "summary": $("#inputSummary").val(),
      "practical_details": $("#inputPracticalDetails").val(),
      "security_details": $("#inputSecurityDetails").val(),
      "user_edit": localStorage.getItem("username")
    }
  };

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
