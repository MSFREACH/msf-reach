/*eslint no-unused-vars: off*/

/**
 * Monitor status code to redirect login page if session expires.
*/
$(function() {
    $.ajaxSetup({
        statusCode: {
            401: function() {
                if (window.location.pathname !== '/login/') {
                    window.location.href = '/login/';
                }
            }
        }
    });
});

var severityColors=['green','orange','red'];
var severityTexts=['low','med','high'];

var severityLabels = ['<span style="color:green">low</span>',
    '<span style="color:orange">med</span>',
    '<span style="color:red">high</span>'];

// Globals
var currentEventId;
var eventReportLink;
var currentEventProperties;
var contactsLayer;
var contactsClusters;
var missionsLayer;
var missionsClusters;
var accessLayer;
var needsLayer;
var securityLayer;
var reportsContactsLayer;
var missionsLayerControlSetUp = false;
var contactsLayerControlSetUp = false;

var PDCHazardsLayer;
var TSRHazardsLayer;
var USGSHazardsLayer;
var GDACSHazardsLayer;
var PTWCHazardsLayer;

// Set cookies if not set
if (typeof(Cookies.get('- access')) === 'undefined') {
    Cookies.set('- access','on'); // default
}
if (typeof(Cookies.get('- needs')) === 'undefined') {
    Cookies.set('- needs','on'); // default
}
if (typeof(Cookies.get('- security')) === 'undefined') {
    Cookies.set('- security','on'); // default
}
if (typeof(Cookies.get('- contacts')) === 'undefined') {
    Cookies.set('- contacts','on'); // default
}
if (typeof(Cookies.get('Contacts')) === 'undefined') {
    Cookies.set('Contacts','on'); // default
}
if (typeof(Cookies.get('Missions')) === 'undefined') {
    Cookies.set('Contacts','on'); // default
}

if (typeof(Cookies.get('MapLayer')) === 'undefined') {
    Cookies.set('MapLayer','Terrain'); // default
}

/**
* Function to get feeds
**/
var getFeeds = function(url, callback) {
    $.getJSON(url, function( data ){
        callback(data.result);
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
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
        'iconUrl': iconUrl,
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

    PDCHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: PDCHazardIcon(feature.properties.summary)});
        },
        onEachFeature: hazardFeature
    });

    if (Cookies.get('- PDC')==='on') {
        PDCHazardsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(PDCHazardsLayer, '- PDC', 'RSS Feeds');

};

/*
* Function to add TSR hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing TSR hazard points
**/

var hazardFeature = function(feature, layer) {
    var popupContent = '<strong><a href=\''+feature.properties.link+'\' target=_blank>' + feature.properties.title +'</a></strong>' + '<BR>Source: '+ feature.properties.source + '<BR>Summary: '+ feature.properties.summary +'<BR>Updated: ' + feature.properties.updated;

    layer.bindPopup(popupContent);
};

var mapTSRHazards = function(hazards){

    TSRHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, L.icon({
                iconUrl: '/resources/images/icons/event_types/typhoon.svg',
                iconSize: [39, 39]
            }));
        },
        onEachFeature: hazardFeature
    });

    if (Cookies.get('- TSR')==='on') {
        TSRHazardsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(TSRHazardsLayer, '- TSR', 'RSS Feeds');

};

/*
* Function to add PTWC hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing PTWC hazard points
**/
var mapPTWCHazards = function(hazards){
    PTWCHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, L.icon({
                iconUrl: '/resources/images/icons/event_types/tsunami.svg',
                iconSize: [39, 39]
            }));
        },
        onEachFeature: hazardFeature
    });

    if (Cookies.get('- PTWC')==='on') {
        PTWCHazardsLayer.addTo(mainMap);
    }

    layerControl.addOverlay(PTWCHazardsLayer, '- PTWC', 'RSS Feeds');

};

/**
* Function to map from GDACS hazard summary to GDACS hazard icon
* @param {String} hazardSummary - hazard summary
**/
var GDACSHazardIcon = function(GDACSProperties) {
    var iconUrl = '/resources/images/hazards/';

    switch(GDACSProperties.type) {
    case 'EQ':
        iconUrl += 'earthquake_';
        break;
    case 'TC':
        iconUrl += 'cyclone_';
        break;
    default:
        console.log('error in GDACS data'); // eslint-disable-line no-console
    }
    switch(GDACSProperties.level) {
    case 'green':
        iconUrl += 'advisory.svg';
        break;
    case 'yellow':
        iconUrl += 'watch.svg';
        break;
    case 'red':
        iconUrl += 'warning.svg';
        break;
    default:
        iconUrl += 'advisory.svg'; // reviewme fixme
    }


    return L.icon({
        'iconUrl': iconUrl,
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
    GDACSHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: GDACSHazardIcon(feature.properties)});
        },
        onEachFeature: hazardFeature
    });

    if (Cookies.get('- GDACS')==='on') {
        GDACSHazardsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(GDACSHazardsLayer, '- GDACS', 'RSS Feeds');

};

/*
* Function to add USGS hazards to map
* @param {Object} hazards - GeoJson FeatureCollection containing USGS hazard points
**/
var mapUSGSHazards = function(hazards){

    USGSHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, L.icon({
                iconUrl: '/resources/images/icons/event_types/earthquake.svg',
                iconSize: [39, 39]
            }));
        },
        onEachFeature: hazardFeature
    });

    if (Cookies.get('- USGS')==='on') {
        USGSHazardsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(USGSHazardsLayer, '- USGS', 'RSS Feeds');

};

function openHazardPopup(id)
{

    switch(id.split('-',1)[0]) {
    case 'USGS':
        USGSHazardsLayer.eachLayer(function(layer){
            if (layer.feature.properties.id === id)
                layer.openPopup();

            var selector='[id="rssdiv'+layer.feature.properties.id+'"]';
            layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
            layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
            layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
            layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
        });
        break;
    case 'PDC':
        PDCHazardsLayer.eachLayer(function(layer){
            if (layer.feature.properties.id == id)
                layer.openPopup();
            var selector='[id="rssdiv'+layer.feature.properties.id+'"]';
            layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
            layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
            layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
            layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
        });
        break;
    case 'TSR':
        TSRHazardsLayer.eachLayer(function(layer){
            if (layer.feature.properties.id == id)
                layer.openPopup();
            var selector='[id="rssdiv'+layer.feature.properties.id+'"]';
            layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
            layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
            layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
            layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
        });
        break;
    case 'PTWC':
        PTWCHazardsLayer.eachLayer(function(layer){
            if (layer.feature.properties.id == id)
                layer.openPopup();
            var selector='[id="rssdiv'+layer.feature.properties.id+'"]';
            layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
            layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
            layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
            layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
        });
        break;
    case 'GDACS':
        GDACSHazardsLayer.eachLayer(function(layer){
            if (layer.feature.properties.id == id)
                layer.openPopup();
            var selector='[id="rssdiv'+sanitiseId(layer.feature.properties.id)+'"]';
            layer.on('mouseover',function(e){$(selector).addClass('isHovered');});
            layer.on('mouseout',function(e){$(selector).removeClass('isHovered');});
            layer.on('touchstart',function(e){$(selector).addClass('isHovered');});
            layer.on('touchend',function(e){$(selector).removeClass('isHovered');});
        });
        break;
    default:
        break;

    }
}
