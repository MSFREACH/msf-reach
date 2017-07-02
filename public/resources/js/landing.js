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
   * Function to print a list of events
   * @param {Object} events - GeoJSON Object containing event details
   */
 var printAllEvents = function(err, events){
   // If called with err, print that instead
   if (err){
     $('#eventsList').append(err);
   } else {
     // Loop through properties and create a HTML list
     var propertiesList = [];
     for (var i = 0; i < events.features.length; i++){
       //console.log(i)
       //console.log(events.features[215]);
       //console.log(events.features.length)
       //$.each( events.features[i].properties, function( key, val ) {
       console.log(events.features[i].properties.id)
         propertiesList.push( "<li id='event'> Event: <a href="+HOSTNAME+"events/?eventId="+events.features[i].properties.id+">"
                               + JSON.stringify(events.features[i].properties.id) + "</a></li>" );
       //});
     //};


     };
     // Create unique link to this event
     //var eventLink = HOSTNAME + 'events/?eventId=' + eventProperties.id;
     // Create unique report link for this event
     //var eventReportLink = HOSTNAME + 'cards/' + //eventProperties.reportkey
     // Append output to body
     $( "<ul/>", {
       "class": "eventPropertiesList",
       html: propertiesList.join( "" )
     }).appendTo( "#eventsList" );
     //$("#eventProperties").append('<p><a href='+eventLink+'>'+eventLink+'</a></p>');
     //$("#eventProperties").append('<p><a href="eventReportLink">'+eventReportLink+'</a></p>');
   }
 }

getAllEvents(printAllEvents);
