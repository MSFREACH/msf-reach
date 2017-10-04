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

var PDCHazardsLayer;
var TSRHazardsLayer;
var USGSHazardsLayer;
var GDACSHazardsLayer;
var PTWCHazardsLayer;

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

  var type = feature.properties.metadata.sub_type != '' ? feature.properties.metadata.sub_type : feature.properties.type;

  var popupContent = "<img src='/resources/images/icons/event_types/"+type+".svg' width='40'>" +
  "<strong><a href='events/?eventId=" + feature.properties.id +
  "'>Event " + feature.properties.id +"</a></strong>" + "<BR>" +
  "Created: " + feature.properties.created + "<BR>" +
  "Type: " + type.replace('_',' ') + "<br>" +
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

/**
* Function to print a table of events
* @param {Object} events - GeoJSON Object containing event details
*/
var mapAllEvents = function(err, events){

  console.log(L.version);

  var eventsLayer = L.geoJSON(events, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: L.icon({
        iconUrl: '/resources/images/icons/event_types/open_event.svg',
        iconSize:     [50, 50], // size of the icon
        iconAnchor: [25, 50],
        popupAnchor: [0, -40]
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
* Function to map from PDC hazard summary to PDC hazard icon
* @param {String} hazardSummary - hazard summary
**/
var PDCHazardIcon = function(hazardSummary) {
  var iconUrl = '/resources/images/hazards/';
  iconUrl += hazardSummary.split(' ')[0].toLowerCase() + '_' +
  hazardSummary.split(' ')[1].toLowerCase().replace(/(\(|\))/g,'') +
  '.svg';

  return L.icon({
    "iconUrl": iconUrl,
    iconSize:     [39, 39] // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

};

/**
* Function to add PDC hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing PDC hazard points
**/
var mapPDCHazards = function(hazards){
  function onEachFeature(feature, layer) {
    var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

    layer.bindPopup(popupContent);
  }

  PDCHazardsLayer = L.geoJSON(hazards, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: PDCHazardIcon(feature.properties.summary)});
    },
    onEachFeature: onEachFeature
  });

  PDCHazardsLayer.addTo(landingMap);
  layerControl.addOverlay(PDCHazardsLayer, '- PDC', 'Hazards');

};

/*
* Function to add TSR hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing TSR hazard points
**/
var mapTSRHazards = function(hazards){
  function onEachFeature(feature, layer) {
    var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

    layer.bindPopup(popupContent);
  }

  TSRHazardsLayer = L.geoJSON(hazards, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, L.icon({
        iconUrl: '/resources/images/icons/event_types/typhoon.svg',
        iconSize: [39, 39]
      }));
    },
    onEachFeature: onEachFeature
  });

  TSRHazardsLayer.addTo(landingMap);
  layerControl.addOverlay(TSRHazardsLayer, '- TSR', 'Hazards');

};

/*
* Function to add PTWC hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing PTWC hazard points
**/
var mapPTWCHazards = function(hazards){
  function onEachFeature(feature, layer) {
    var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

    layer.bindPopup(popupContent);
  }

  PTWCHazardsLayer = L.geoJSON(hazards, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, L.icon({
        iconUrl: '/resources/images/icons/event_types/tsunami.svg',
        iconSize: [39, 39]
      }));
    },
    onEachFeature: onEachFeature
  });

  PTWCHazardsLayer.addTo(landingMap);
  layerControl.addOverlay(PTWCHazardsLayer, '- PTWC', 'Hazards');

};

/**
* Function to map from GDACS hazard summary to GDACS hazard icon
* @param {String} hazardSummary - hazard summary
**/
var GDACSHazardIcon = function(GDACSProperties) {
  var iconUrl = '/resources/images/hazards/';

  switch(GDACSProperties.type) {
    case "EQ":
    iconUrl += 'earthquake_';
    break;
    case "TC":
    iconUrl += 'cyclone_';
    break;
    default:
    console.log("error in GDACS data");
  }
  switch(GDACSProperties.level) {
    case "green":
    iconUrl += 'advisory.svg';
    break;
    case "yellow":
    iconUrl += 'watch.svg';
    break;
    case "red":
    iconUrl += 'warning.svg';
    break;
    default:
    console.log("error in GDACS data");
  }


  return L.icon({
    "iconUrl": iconUrl,
    iconSize:     [39, 39] // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

};

/*
* Function to add GDACS hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing GDACS hazard points
**/
var mapGDACSHazards = function(hazards){
  function onEachFeature(feature, layer) {
    var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

    layer.bindPopup(popupContent);
  }

  GDACSHazardsLayer = L.geoJSON(hazards, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: GDACSHazardIcon(feature.properties)});
    },
    onEachFeature: onEachFeature
  });

  GDACSHazardsLayer.addTo(landingMap);
  layerControl.addOverlay(GDACSHazardsLayer, '- GDACS', 'Hazards');

};

/*
* Function to add USGS hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing USGS hazard points
**/
var mapUSGSHazards = function(hazards){
  function onEachFeature(feature, layer) {
    var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

    layer.bindPopup(popupContent);
  }

  USGSHazardsLayer = L.geoJSON(hazards, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, L.icon({
        iconUrl: '/resources/images/icons/event_types/earthquake.svg',
        iconSize: [39, 39]
      }));
    },
    onEachFeature: onEachFeature
  });

  USGSHazardsLayer.addTo(landingMap);
  layerControl.addOverlay(USGSHazardsLayer, '- USGS', 'Hazards');

};

function openHazardPopup(id)
{
  console.log(id);

  switch(id.split('-',1)[0]) {
    case "USGS":
    USGSHazardsLayer.eachLayer(function(layer){
      if (layer.feature.properties.id === id)
      layer.openPopup();
      console.log("DB" + layer.feature.properties.id);
      var selector='[id="rssdiv'+layer.feature.properties.id+'"]';
      layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
      layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
      layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
      layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
    });
    break;
    case "PDC":
    PDCHazardsLayer.eachLayer(function(layer){
      if (layer.feature.properties.id == id)
      layer.openPopup();
      layer.on('mouseover',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('mouseout',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
      layer.on('touchstart',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('touchend',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
    });
    break;
    case "TSR":
    TSRHazardsLayer.eachLayer(function(layer){
      if (layer.feature.properties.id == id)
      layer.openPopup();
      layer.on('mouseover',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('mouseout',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
      layer.on('touchstart',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('touchend',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
    });
    break;
    case "PTWC":
    PTWCHazardsLayer.eachLayer(function(layer){
      if (layer.feature.properties.id == id)
      layer.openPopup();
      layer.on('mouseover',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('mouseout',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
      layer.on('touchstart',function(e){$('#rssdiv'+layer.feature.properties.id).addClass('isHovered');});
      layer.on('touchend',function(e){$('#rssdiv'+layer.feature.properties.id).removeClass('isHovered');});
    });
    break;
    case "GDACS":
    GDACSHazardsLayer.eachLayer(function(layer){
      if (layer.feature.properties.id == id)
      layer.openPopup();
      layer.on('mouseover',function(e){$('#rssdiv'+sanitiseId(layer.feature.properties.id)).addClass('isHovered');});
      layer.on('mouseout',function(e){$('#rssdiv'+sanitiseId(layer.feature.properties.id)).removeClass('isHovered');});
      layer.on('touchstart',function(e){$('#rssdiv'+sanitiseId(layer.feature.properties.id)).addClass('isHovered');});
      layer.on('touchend',function(e){$('#rssdiv'+sanitiseId(layer.feature.properties.id)).removeClass('isHovered');});
    });
    break;
    default:
    console.log("Hazards layer not found");

  }
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
* Function to get feeds
**/
var getFeeds = function(url, callback) {
  $.getJSON(url, function( data ){
    callback(data.result);
  });
};

var tableFeeds = function(feeds) {
  for(var i = 0; i <= feeds.features.length; i++) {
    var feature = feeds.features[i];
    if (feature) {
      $('#rssFeeds').append(
        '<div id="rssdiv'+feature.properties.id+'" class="list-group-item" onclick="openHazardPopup(\''+feature.properties.id+'\')">' +
        'Name: <a target="_blank" href="' + feature.properties.link + '">' + feature.properties.title + '</a><br>' +
        'Updated: ' + feature.properties.updated + '<br>' +
        'Summary: ' + feature.properties.summary.trim() + '<br>' +
        '</div>'
      );
    }
  }
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
    iconUrl: '/resources/images/icons/event_types/historical.svg',

    iconSize:     [50, 50], // size of the icon
    opacity: 0.8,
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
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

var groupedOverlays = {
  "Hazards": {},
};

var baseLayers = {};

var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

var overlayMaps = {};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, groupOptions).addTo(landingMap);

getAllEvents(mapAllEvents);
getFeeds("/api/hazards/pdc",mapPDCHazards);
getFeeds("/api/hazards/tsr",mapTSRHazards);
getFeeds("/api/hazards/usgs",mapUSGSHazards);
getFeeds("/api/hazards/gdacs",mapGDACSHazards);
getFeeds("/api/hazards/ptwc",mapPTWCHazards);
getMissions(mapMissions);
getContacts(mapContacts);

getFeeds("/api/hazards/pdc", tableFeeds);
getFeeds("/api/hazards/usgs", tableFeeds);
getFeeds("/api/hazards/tsr", tableFeeds);
getFeeds("/api/hazards/gdacs", tableFeeds);
getFeeds("/api/hazards/ptwc", tableFeeds);
