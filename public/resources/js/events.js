/**
 * Events page script
 * @file public/resources/js/events.js
 * Display and interact with event objects from events page
 */

// Constants
 GEOFORMAT = 'geojson'; // Change to topojson for prod
 HOSTNAME = 'http://localhost:8001/'; // Change to host for prod

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
    var propertiesList = [];
    $.each( eventProperties, function( key, val ) {
      propertiesList.push( "<li id='" + key + "'>" + key + ": "
                            + JSON.stringify(val) + "</li>" );
    });

    // Create unique link to this event
    var eventLink = HOSTNAME + eventProperties.id;

    // Create unique report link for this event
    var eventReportLink = HOSTNAME + '/cards/' + eventProperties.report_key

    // Append output to body
    $( "<ul/>", {
      "class": "eventPropertiesList",
      html: propertiesList.join( "" )
    }).appendTo( "#eventProperties" );
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
  $.getJSON('/api/events/' + eventId + '?' + GEOFORMAT, function ( data ){
    // Print output to page
    callback(null, data.result.features[0].properties);
  }).fail(function(err) {
    // Catch condition where no data returned
    callback(err.responseText, null);
  })
}

var getReports = function(eventId, callback){
  $.getJSON('/api/reports/?eventId=' + eventId + '&' + GEOFORMAT, function( data ){
    callback(data);
  });
};

// Main (effective)
var eventId = getQueryVariable("eventId");
// Only ask API where event is specified and not empty
if (eventId !== false && eventId != ''){
  getEvent(eventId, printEventProperties);
  getReports(eventId, function(reports){
    console.log(reports);
  })
} else {
  // Catch condition where no event specified, print to screen
  printEventProperties('No event ID specified', null)
}
