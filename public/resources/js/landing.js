/**
* Landing page script
* @file public/resources/js/landing.js
* Show overview of MSF Reach events
*/

// Constants
var GEOFORMAT='geojson';
var HOSTNAME='http://localhost:8001/';
var TYPES=[{'conflict':'Conflict'}, {'natural_hazard':'Natural disaster'},
{'epidemiological':'Disease outbreak'}, {'search_and_rescue':'Search and rescue'},
{'displacement':'Displacement'}, {'malnutrition':'Malnutrition'}, {'other':'Other (detail in summary)'}
];

var TYPEICONS={'conflict':'CONFLICT-47.svg', 'epidemiological':'EPIDEMIC-44.svg' , 'search_and_rescue':'SEARCH_AND_RESCUE-48.svg', 'displacement':'DISPLACEMENT-46.svg','malnutrition':'MALNUTRITION-45.svg' };

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
  });
};

// Add popups
function onEachFeature(feature, layer) {
  var affectedPopulationStr = '';
  if (typeof(feature.properties.metadata.population_affected) !== 'undefined' && feature.properties.metadata.population_affected !== '') {
    affectedPopulationStr = 'Population affected: ' + feature.properties.metadata.population_affected + '<br>';
  }

  var totalPopulationStr = '';
  if (typeof(feature.properties.metadata.population_total) !== 'undefined' && feature.properties.metadata.population_total !== '') {
    totalPopulationStr = 'Total population: ' + feature.properties.metadata.population_total + '<br>';
  }

  var notificationStr = '';
  var statusStr = '';
  if(typeof(feature.properties.metadata.notification)!=='undefined') {
    notificationStr = 'Latest notification: ' + feature.properties.metadata.notification + '<br>';
  }
  if(typeof(feature.properties.metadata.event_status)!=='undefined') {
    statusStr = 'Status: ' + feature.properties.metadata.event_status + '<br>';
  } else {
    statusStr = 'Status: ' + feature.properties.status + '<br>';
  }

  var popupContent = "<strong><a href='events/?eventId=" + feature.properties.id +
    "'>Event " + feature.properties.id +"</a></strong>" + "<BR>" +
    "Created: " + feature.properties.created + "<BR>" +
    "Type: " + feature.properties.type + "<br>" +
    statusStr +
    notificationStr +
    totalPopulationStr +
    affectedPopulationStr;


  if (popupContent.endsWith('<br>')) {
    popupContent.substr(0,popupContent.length-4);
  }

  $('#eventProperties').append(
    '<div class="list-group-item">' +
    'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
    'Created: ' + feature.properties.created + '<br>' +
    'Type: ' + feature.properties.type + '<br>' +
    statusStr +
    notificationStr +
    totalPopulationStr +
    affectedPopulationStr +
    '</div>'
  );

  if (feature.properties && feature.properties.popupContent) {
    popupContent += feature.properties.popupContent;
  }

  layer.bindPopup(popupContent);
}

  // MSF Icons
  function  getEventIcon(typeKey) {
    var iconFile='msf_icon.png';
    var iconSize=39;
    if (TYPEICONS[typeKey]) {
      iconFile='icons/event_types/'+TYPEICONS[typeKey];
      iconSize=78;
    }

    return L.icon({
      iconUrl: ('/resources/images/'+iconFile),

      iconSize:     [iconSize, iconSize], // size of the icon
      //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
      //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });
  }

  /**
  * Function to print a table of events
  * @param {Object} events - GeoJSON Object containing event details
  */
  var mapAllEvents = function(err, events){

    var eventsLayer = L.geoJSON(events, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: L.icon({
          iconUrl: '/resources/images/icons/event_types/open_event.svg',
          iconSize:     [50, 50], // size of the icon
          //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
          //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
        })});
      },
      onEachFeature: onEachFeature
    });
    eventsLayer.addTo(landingMap);
    layerControl.addOverlay(eventsLayer, 'Current Events');

  };

  /**
  * Function to get reports for an event
  * @param {Number} eventId - UniqueId of event
  **/
  var getHazards = function(callback){
    $.getJSON('/api/hazards/', function( data ){
      callback(data.result);
    });
  };

  /**
  * Function to map from hazard summary to hazard icon
  * @param {String} hazardSummary - hazard summary
  **/
  var hazardIcon = function(hazardSummary) {
    var iconUrl = '/resources/images/hazards/';
    iconUrl += hazardSummary.split(' ')[0].toLowerCase() + '-' +
      hazardSummary.split(' ')[1].toLowerCase().replace(/(\(|\))/g,'');

    return L.icon({
      "iconUrl": iconUrl,
      iconSize:     [39, 39], // size of the icon
      //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
      //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

  };

  /**
  * Function to add hazards to map
  * @param {Object} hazards - GeoJson FeatureCollection containing hazard points
  **/
  var mapHazards = function(hazards){
    function onEachFeature(feature, layer) {
      var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

      layer.bindPopup(popupContent);
    }

    var hazardsLayer = L.geoJSON(hazards, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: hazardIcon(feature.properties.summary)});
      },
      onEachFeature: onEachFeature
    });
    hazardsLayer.addTo(landingMap);
    layerControl.addOverlay(hazardsLayer, 'PDC Hazards');

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
        if (typeof(feature.properties.properties.notification) !== 'undefined'){
          popupContent += 'Latest notification: ' + feature.properties.properties.notification + '<BR>';
        }
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
    missionsLayer.addTo(landingMap);
    layerControl.addOverlay(missionsLayer, 'Mission Histories');
  };


  /**
  * Function to add contacts to map
  * @param {Object} contacts - GeoJson FeatureCollection containing contact points
  **/
  var mapContacts = function(contacts ){

    function onEachFeature(feature, layer) {

      var popupContent = '';

      if (feature.properties && feature.properties.properties) {
        popupContent =
        'name: '+(typeof(feature.properties.properties.title)==='undefined' ? '' : feature.properties.properties.title) + ' ' + feature.properties.properties.name +
          '<br>email: '+(typeof(feature.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a>') +
          '<br>mobile: '+(typeof(feature.properties.properties.cell)==='undefined' ? '' : feature.properties.properties.cell) +
          '<br>type: '+(typeof(feature.properties.properties.type)==='undefined' ? '' : feature.properties.properties.type) +
          '<br>speciality: '+(typeof(feature.properties.properties.speciality)==='undefined' ? '' : feature.properties.properties.speciality);
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
    //contactsLayer.addTo(landingMap);
    layerControl.addOverlay(contactsLayer, 'Contacts');

  };


  // Create map
  var landingMap = L.map('landingMap').setView([-6.8, 108.7], 7);

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
  }).addTo(landingMap);

  var baseMaps = {
    "Terrain": mapboxTerrain,
    "Satellite" : mapboxSatellite
  };

  var overlayMaps = {};

  var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(landingMap);

  getAllEvents(mapAllEvents);
  getHazards(mapHazards);
  getMissions(mapMissions);
  getContacts(mapContacts);
