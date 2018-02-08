/*eslint no-unused-vars: off*/

/**
* Landing page script
* @file public/resources/js/landing.js
* Show overview of MSF Reach events
*/

// Constants
var GEOFORMAT='geojson';
var TYPES=[{'conflict':'Conflict'}, {'natural_hazard':'Natural disaster'},
    {'epidemiological':'Disease outbreak'}, {'search_and_rescue':'Search and rescue'},
    {'displacement':'Displacement'}, {'malnutrition':'Malnutrition'}, {'other':'Other (detail in summary)'}
];

var PDCHazardsLayer;
var TSRHazardsLayer;
var USGSHazardsLayer;
var GDACSHazardsLayer;
var PTWCHazardsLayer;

$( '#inputSeverityScale' ).slider({
    value: 2,
    min: 1,
    max: 3,
    step: 1
})
    .each(function() {

        //
        // Add labels to slider whose values
        // are specified by min, max and whose
        // step is set to 1
        //

        // Get the options for this slider
        var opt = $(this).data().uiSlider.options;

        // Get the number of possible values
        var vals = opt.max - opt.min;

        // Space out values
        for (var i = 0; i <= vals; i++) {

            var el = $('<label>'+severityLabels[i]+'</label>').css('left',(i/vals*100)+'%');

            $( '#inputSeverityScale' ).append(el);

        }

    });

// Set cookies if not set
if (typeof(Cookies.get('Mission Histories')) === 'undefined') {
    Cookies.set('Mission Histories','on'); // default
}
if (typeof(Cookies.get('Current Events')) === 'undefined') {
    Cookies.set('Current Events','on'); // default
}
if (typeof(Cookies.get('- PDC')) === 'undefined') {
    Cookies.set('- PDC','on'); // default
}
if (typeof(Cookies.get('- TSR')) === 'undefined') {
    Cookies.set('- TSR','on'); // default
}
if (typeof(Cookies.get('- PTWC')) === 'undefined') {
    Cookies.set('- PTWC','on'); // default
}
if (typeof(Cookies.get('- GDACS')) === 'undefined') {
    Cookies.set('- GDACS','on'); // default
}
if (typeof(Cookies.get('- USGS')) === 'undefined') {
    Cookies.set('- USGS','on'); // default
}
if (typeof(Cookies.get('- MSF Staff')) === 'undefined') {
    Cookies.set('- MSF Staff','on'); // default
}
if (typeof(Cookies.get('- other contacts')) === 'undefined') {
    Cookies.set('- other contacts','on'); // default
}

var eventsLayer;

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
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            callback(err.responseText, null);
        }
    });
};

/**
* Function to map and print a table of events
* @param {Object} events - GeoJSON Object containing event details
*/
var mapAllEvents = function(err, events){

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
        } else {
            notificationStr = 'Latest notification: (none)<br>';
        }
        if(typeof(feature.properties.metadata.event_status)!=='undefined') {
            statusStr = 'Status: ' + feature.properties.metadata.event_status + '<br>';
        } else {
            statusStr = 'Status: ' + feature.properties.status + '<br>';
        }

        var severityStr = '';

        if (feature.properties.metadata.hasOwnProperty('severity')) {
            severityStr += 'Severity comment: ' + feature.properties.metadata.severity + '<br>';
        }
        if (feature.properties.metadata.hasOwnProperty('severity_scale')) {
            severityStr += severityLabels[feature.properties.metadata.severity-1] + '<br>';
        }


        var type = feature.properties.metadata.sub_type != '' ? feature.properties.metadata.sub_type : feature.properties.type;
        var icon_name = type;
        if (feature.properties.type.toLowerCase().includes('epidemiological')) {
            icon_name = 'epidemic';
        }

        var popupContent = '<a href=\'/events/?eventId=' + feature.properties.id +
    '\'><img src=\'/resources/images/icons/event_types/'+icon_name+'.svg\' width=\'40\'></a>' +
    '<strong><a href=\'/events/?eventId=' + feature.properties.id +
    '\'>' + feature.properties.metadata.name +'</a></strong>' + '<BR>' +
    'Opened: ' + (feature.properties.metadata.event_datetime || feature.properties.created_at) + '<BR>' +
    'Last updated at: ' + feature.properties.updated_at.split('T')[0] + '<br>' +
    'Type: ' + type.replace('_',' ') + '<br>' +
    statusStr +
    severityStr +
    notificationStr +
    totalPopulationStr +
    affectedPopulationStr;


        if (popupContent.endsWith('<br>')) {
            popupContent.substr(0,popupContent.length-4);
        }

        $('#eventProperties').append(
            '<div class="list-group-item">' +
      'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
      'Opened: ' + (feature.properties.metadata.event_datetime || feature.properties.created_at) + '<br>' +
      'Last updated at: ' + feature.properties.updated_at.split('T')[0] + '<br>' +
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

    eventsLayer = L.geoJSON(events, {
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

    if (Cookies.get('Current Events')==='on') {
        eventsLayer.addTo(landingMap);
    }
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
        PDCHazardsLayer.addTo(landingMap);
    }
    layerControl.addOverlay(PDCHazardsLayer, '- PDC', 'Hazards');

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
        TSRHazardsLayer.addTo(landingMap);
    }
    layerControl.addOverlay(TSRHazardsLayer, '- TSR', 'Hazards');

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
        PTWCHazardsLayer.addTo(landingMap);
    }

    layerControl.addOverlay(PTWCHazardsLayer, '- PTWC', 'Hazards');

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
        GDACSHazardsLayer.addTo(landingMap);
    }
    layerControl.addOverlay(GDACSHazardsLayer, '- GDACS', 'Hazards');

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
        USGSHazardsLayer.addTo(landingMap);
    }
    layerControl.addOverlay(USGSHazardsLayer, '- USGS', 'Hazards');

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


/**
* Function to get contacts
**/
var getContacts = function(callback){
    $.getJSON('/api/contacts/?geoformat=' + GEOFORMAT, function( data ){
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
* Function to get missions
**/
var getMissions = function(callback){
    $.getJSON('/api/missions/?geoformat=' + GEOFORMAT, function( data ){
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

var tableFeeds = function(feeds) {
    for(var i = 0; i <= feeds.features.length; i++) {
        var feature = feeds.features[i];
        if (feature) {
            $('#rssFeeds').append(
                '<div id="rssdiv'+feature.properties.id+'" class="list-group-item rss-item" onclick="openHazardPopup(\''+feature.properties.id+'\')">' +
        'Name: <a target="_blank" href="' + feature.properties.link + '">' + feature.properties.title + '</a><br>' +
        'Source: ' + feature.properties.source + '<br>' +
        'Updated: ' + feature.properties.updated + '<br>' +
        'Summary: ' + feature.properties.summary.trim() + '<br>' +
        '</div>'
            );
        }
    }
};

/**
* Function to return an icon for mission in popupContent
* @param {String} type - type of disaster
**/
var missionPopupIcon = function(missionType) {
    var type = typeof(missionType)!=='undefined' ? missionType.toLowerCase() : '';
    var html = '<img src="/resources/images/icons/event_types/';
    if (type.includes('conflict')) {
        html += 'conflict';
    } else if (type.includes('displacement')) {
        html += 'displacement';
    } else if (type.includes('drought')) {
        html += 'fire';
    } else if (type.includes('earthquake')) {
        html += 'earthquake';
    } else if (type.includes('epidemic') || type.includes('disease')) {
        html += 'epidemic';
    } else if (type.includes('fire')) {
        html += 'fire';
    } else if (type.includes('flood')) {
        html += 'flood';
    } else if (type.includes('historic')) {
        html += 'historical';
    } else if (type.includes('industrial')) {
        html += 'industrial_disaster';
    } else if (type.includes('landslide')) {
        html += 'landslide';
    } else if (type.includes('malnutrition')) {
        html += 'malnutrition';
    } else if (type.includes('search')) {
        html += 'search_and_rescue';
    } else if (type.includes('tsunami')) {
        html += 'tsunami';
    } else if (type.includes('typhoon') || type.includes('hurricane') || type.includes('cyclone')) {
        html += 'typhoon';
    } else if (type.includes('volcano')) {
        html += 'volcano';
    } else {
        return missionType + '<br>'; // just return text in this case
    }
    html += '.svg" width="40">';

    return html;
};

/**
* Function to add missions to map
* @param {Object} missions - GeoJson FeatureCollection containing mission points
**/
var mapMissions = function(missions ){

    function onEachFeature(feature, layer) {

        var popupContent = '';

        if (feature.properties && feature.properties.properties) {
            popupContent += '<a href="#" data-toggle="modal" data-target="#missionModal" onclick="onMissionLinkClick(' +
        feature.properties.id +
        ')">' + missionPopupIcon(feature.properties.properties.type) + '</a>';
            popupContent += '<a href="#" data-toggle="modal" data-target="#missionModal" onclick="onMissionLinkClick(' +
        feature.properties.id +
        ')">' + feature.properties.properties.name + '</a><br>';
            if (typeof(feature.properties.properties.notification) !== 'undefined'){
                popupContent += 'Latest notification: ' + feature.properties.properties.notification + '<BR>';
            } else {
                popupContent += 'Latest notification: (none)<BR>';
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

    if (Cookies.get('Mission Histories')==='on') {
        missionsLayer.addTo(landingMap);
    }
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
            popupContent = 'Full name: <a href="#" onclick="onContactLinkClick(' +
        feature.properties.id +
        ')" data-toggle="modal" data-target="#contactDetailsModal">' +
      (typeof(feature.properties.properties.title)==='undefined' ? '' : feature.properties.properties.title) + ' ' + feature.properties.properties.name + '</a>' +
      '<br>Email address: '+(typeof(feature.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a>') +
      '<br>Mobile: '+(typeof(feature.properties.properties.cell)==='undefined' ? '' : feature.properties.properties.cell) +
      '<br>Type of contact: '+(typeof(feature.properties.properties.type)==='undefined' ? '' : feature.properties.properties.type) +
      '<br>Speciality: '+(typeof(feature.properties.properties.speciality)==='undefined' ? '' : feature.properties.properties.speciality);
        }

        layer.bindPopup(popupContent);
    }

    // function returns list of msf staff contacts if msf is true, else other contacts
    function msfContact(contacts, msf) {

        var newFC = {features: []};
        for(var i = 0; i < contacts.features.length; i++) {

            if(contacts.features[i].properties.properties.hasOwnProperty('type') && contacts.features[i].properties.properties.type === 'Current MSF Staff' || contacts.features[i].properties.properties.type.toUpperCase().includes('MSF') && !contacts.features[i].properties.properties.type.toLowerCase().includes('peer')) {
                if (msf) {
                    newFC.features.push(contacts.features[i]);
                }
            } else if (!msf) {
                newFC.features.push(contacts.features[i]);
            }
        }
        return newFC;
    }

    // MSF Icons
    var contactIcon = L.icon({
        iconUrl: '/resources/images/icons/contacts/Contact_Red-42.svg',

        iconSize:     [36, 36], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

    var MSFContactsLayer = L.geoJSON(msfContact(contacts,true), {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: contactIcon});
        },
        onEachFeature: onEachFeature
    });

    var nonMSFContactsLayer = L.geoJSON(msfContact(contacts,false), {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: contactIcon});
        },
        onEachFeature: onEachFeature
    });

    if (Cookies.get('- MSF Staff')==='on') {
        MSFContactsLayer.addTo(landingMap);
    }
    if (Cookies.get('- other contacts')==='on') {
        nonMSFContactsLayer.addTo(landingMap);
    }
    layerControl.addOverlay(MSFContactsLayer, '- MSF Staff', 'Contacts');
    layerControl.addOverlay(nonMSFContactsLayer, '- other contacts', 'Contacts');

};

var onMissionLinkClick = function(id) {
    $.getJSON('/api/missions/' + id, function(data) {
        missionData = data ? data.result.objects.output.geometries[0].properties.properties : {};
        missionCoordinates = data ? data.result.objects.output.geometries[0].coordinates : {};
        $( '#missionModalBody' ).load( '/events/mission.html' );
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
};

var onContactLinkClick = function(id) {
    $('#contactDetailsModal').on('shown.bs.modal');
    getContact(id);
};

var convertToLocaleDate= function (isoDate) {
    if (isoDate)
        return (new Date(isoDate)).toLocaleString();
    else
        return '';
};

var contactInfo = {};
var getContact = function(id) {
    $.getJSON('/api/contacts/' + id, function(contact) {
        contactInfo = contact.result ? contact.result.properties : {};
        //$('#contactDetailsModal').find('div.form-group').hide();
        $('span.filed').html(convertToLocaleDate(contact.result.created_at));
        $('span.updated').html(convertToLocaleDate(contact.result.updated_at));
        $('span.last_email').html(convertToLocaleDate(contact.result.last_email_sent_at));

        // fiddle booleans to 'yes'/'no'
        contact.result.properties.msf_peer = contact.result.properties.msf_peer ? 'yes' : 'no';
        contact.result.properties.msf_associate = contact.result.properties.msf_associate ? 'yes' : 'no';


        // if web address
        if (contact.result.properties.web) {
            // prepend http:// to web (don't assume https, assume redirection)
            if (!contact.result.properties.web.startsWith('http')) {
                contact.result.properties.web = 'http://' + contact.result.properties.web;
            }
            // make it a link
            contact.result.properties.web = '<a href="'+contact.result.properties.web + '">'+contact.result.properties.web+'</a>';
        }

        // also hyperlink emails
        if (contact.result.properties.email) {
            contact.result.properties.email = '<a href="'+contact.result.properties.email + '">'+contact.result.properties.email+'</a>';
        }
        if (contact.result.properties.email2) {
            contact.result.properties.email2 = '<a href="'+contact.result.properties.email2 + '">'+contact.result.properties.email2+'</a>';
        }

        _(contact.result.properties).forIn(function(value, key) {
            // console.log("Key:", key, "Value", value);
            $('span.' + key).html(value);
            $('span.' + key).parent().toggle(!!(value));

        });
        if (contact.result.properties.type === 'Current MSF Staff') {
            $('#msf_details').show();
            $('#employment_details').hide();
        } else {
            $('#msf_details').hide();
            $('#employment_details').show();
        }
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            // Catch condition where no data returned
            alert('error: ' + err.responseText);
        }
    });
};

// Create map
var landingMap = L.map('landingMap').setView([20, 110], 4);

// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
}).addTo(landingMap);

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

var baseMaps = {
    'Terrain': mapboxTerrain,
    'Satellite' : mapboxSatellite
};

var groupedOverlays = {
    'Hazards': {},
    'Contacts': {}
};

var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

var overlayMaps = {};

var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, groupOptions).addTo(landingMap);

getAllEvents(mapAllEvents);

getFeeds('/api/hazards/pdc',mapPDCHazards);
getFeeds('/api/hazards/tsr',mapTSRHazards);
getFeeds('/api/hazards/usgs',mapUSGSHazards);
getFeeds('/api/hazards/gdacs',mapGDACSHazards);
getFeeds('/api/hazards/ptwc',mapPTWCHazards);
getMissions(mapMissions);
getContacts(mapContacts);

getFeeds('/api/hazards/pdc', tableFeeds);
getFeeds('/api/hazards/usgs', tableFeeds);
getFeeds('/api/hazards/tsr', tableFeeds);
getFeeds('/api/hazards/gdacs', tableFeeds);
getFeeds('/api/hazards/ptwc', tableFeeds);

var displayVideo = function(video) {

    var video_div = document.getElementById(video+'_video');
    var icon = document.getElementById(video+'_icon');
    if (video_div.style.display === 'none') {
        video_div.style.display = 'block';
        icon.innerHTML='&darr;';
    } else {
        video_div.style.display = 'none';
        icon.innerHTML='&uarr;';
    }

};

landingMap.on('overlayadd', function (layersControlEvent) {
    Cookies.set(layersControlEvent.name,'on');
});

landingMap.on('overlayremove', function (layersControlEvent) {
    Cookies.set(layersControlEvent.name,'off');
});
