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
  var percentagePopulation = String(Math.round(Number(feature.properties.metadata.population_affected)/Number(feature.properties.metadata.population_total)*100));
  var popupContent = "<strong><a href='events/?eventId=" + feature.properties.id +
    "'>Event " + feature.properties.id +"</a></strong>" +
    "<BR>Status: " + feature.properties.status +
    "<BR>Type: " + feature.properties.type +
    "<BR>Created: " + feature.properties.created +
    "<BR>Total population: " + feature.properties.metadadata.population_total +
    "<BR>% pop. affected: " + percentagePopulation;
  $('#eventProperties').append(
    '<p>' +
    'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
    'Type: ' + feature.properties.type + '<br>' + // needs conversion
    'Status: ' + feature.properties.status + '<br>' +
    'Created: ' + feature.properties.created + '<br>' +
    'Total population: ' + feature.properties.metadata.population_total + '<br>' +
    '% pop. affected: ' + percentagePopulation +
    '</p>');
    if (feature.properties && feature.properties.popupContent) {
      popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
  }

  // MSF Icons
  var msfIcon = L.icon({
    iconUrl: '/resources/images/msf_icon.png',

    iconSize:     [26, 26], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
  });

  /**
  * Function to print a table of events
  * @param {Object} events - GeoJSON Object containing event details
  */
  var mapAllEvents = function(err, events){
    // If called with err, log that instead
    if (err){
      console.log( 'Error: ' + err );
    } else {
      for (var i = 0; i < TYPES.length; i++){
        var key = Object.keys(TYPES[i])[0];
        var name = TYPES[i][key];
        var layer = L.geoJSON(events, {
          pointToLayer: function(feature, latlng){
            return L.marker(latlng, {icon: msfIcon});
          },
          onEachFeature: onEachFeature,
          filter: function(feature, layer){
            if (feature.properties.type === key) {
              return feature;
            }
          }});
          layer.addTo(landingMap);
          layerControl.addOverlay(layer, name);
        }
      }
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
    * Function to add hazards to map
    * @param {Object} hazards - GeoJson FeatureCollection containing hazard points
    **/
    var mapHazards = function(hazards){
      function onEachFeature(feature, layer) {
        var popupContent = "<strong><a href='"+feature.properties.link+"' target=_blank>" + feature.properties.title +"</a></strong>" + "<BR><BR>"+ feature.properties.summary +"<BR><BR>" + feature.properties.updated +"<BR>" + feature.properties.id;

        layer.bindPopup(popupContent);
      }

      var hazardsMarker = L.divIcon({className: 'hazard-icon', html: '<span class="glyphicon glyphicon-certificate"></span>'});

      var hazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: hazardsMarker});
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
          popupContent += 'Start date: ' + feature.properties.properties.startDate + '<BR>';
          popupContent += 'Finish date: ' + feature.properties.properties.finishDate + '<BR>';
          popupContent += 'Managing OC: ' + feature.properties.properties.managingOC + '<BR>';
          popupContent += 'Severity: ' + feature.properties.properties.severity + '<BR>';
          popupContent += 'Capacity: ' + feature.properties.properties.capacity + '<BR>';
        }

        layer.bindPopup(popupContent);
      }

      var missionMarker = L.divIcon({className: 'missions-icon', html: '<span class="glyphicon glyphicon-info-sign"></span>'});


      var missionsLayer = L.geoJSON(missions, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: missionMarker});
        },
        onEachFeature: onEachFeature
      });
      missionsLayer.addTo(landingMap);
      layerControl.addOverlay(missionsLayer, 'past missions');
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
          popupContent += feature.properties.properties.email + '<BR>';
          popupContent += feature.properties.properties.cell;

        }

        layer.bindPopup(popupContent);
      }

      var contactMarker = L.divIcon({className: 'contacts-icon', html: '<span class="glyphicon glyphicon-info-sign"></span>'});


      var contactsLayer = L.geoJSON(contacts, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {icon: contactMarker});
        },
        onEachFeature: onEachFeature
      });
      contactsLayer.addTo(landingMap);
      layerControl.addOverlay(contactsLayer, 'contacts');

    };


    // Create map
    var landingMap = L.map('landingMap').setView([-6.8, 108.7], 7);

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
    }).addTo(landingMap);

    var baseMaps = {
      "Terrain": stamenTerrain,
      "Satellite" : mapboxSatellite
    };

    var overlayMaps = {};

    var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(landingMap);

    getAllEvents(mapAllEvents);
    getHazards(mapHazards);
    //getMissions(mapMissions);
    //getContacts(mapContacts);
