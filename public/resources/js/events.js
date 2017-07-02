/**
 * Events page script
 * @file public/resources/js/events.js
 * Display and interact with event objects from events page
 */

/**
  * Function to print a list of event details to web page
  * @param {Object} eventProperties - Object containing event details
  */
var printEventProperties = function(err, eventProperties){
  // If called with err, print that instead
  if (err){
    $('body').append(err);
  } else {
    // Loop through properties and create a HTML list
    var propertiesList = [];
    $.each( eventProperties, function( key, val ) {
      propertiesList.push( "<li id='" + key + "'>" + key + ": "
                            + JSON.stringify(val) + "</li>" );
    });
    // Append output to body
    $( "<ul/>", {
      "class": "my-new-list",
      html: propertiesList.join( "" )
    }).appendTo( "body" );
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
  $.getJSON('/api/events/' + eventId + '?geoformat=geojson', function ( data ){
    // Print output to page
    callback(null, data.result.features[0].properties);
  }).fail(function(err) {
    // Catch condition where no data returned
    callback(err.responseText, null);
  })
}

// Main (effective)
var event = getQueryVariable("eventId");
// Only ask API where event is specified and not empty
if (event !== false && event != ''){
  getEvent(event, printEventProperties);
} else {
  // Catch condition where no event specified
  $('body').append('no event ID specified');
}
