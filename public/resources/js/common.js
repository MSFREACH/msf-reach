/*eslint no-unused-vars: off*/

// Constants
var GEOFORMAT = 'geojson'; // Change to topojson for prod

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
            },
            403: function() {
                var current_modal = jQuery('.modal.in').attr('id'); // modalID or undefined
                if (current_modal) { // modal is active
                    $('#' + current_modal).modal('hide'); // close modal
                }
                $('#operatorAccessModel').modal('show');
            }
        }
    });
});

var typeStr = function(type, sub_type) {
    var result = type.replace(/epidemiological/,'').replace(/natural_hazard/,'').replace(/_/g,' ').replace(/^,/,'').replace(/,$/,'').replace(/,,/g,',').replace(/,/g,', ');
    if (result !== '') {
        result += sub_type ? (', ' + sub_type.replace(/_/g,' ').replace(/,/g,', ')) : '';
    } else {
        result += sub_type ? (sub_type.replace(/_/g,' ').replace(/,/g,', ')) : '';
    }
    return result.slice(0,1).toUpperCase()+result.slice(1);
};

var severityColors=['green','orange','red'];
var severityTexts=['low','med','high'];
var severityLongTexts=['low','medium','high'];

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

var computerTriggered = false; // keep track of events that are computer triggered so we can deal just with human triggered ones


var PDCHazardsLayer;
var TSRHazardsLayer;
var USGSHazardsLayer;
var GDACSHazardsLayer;
var PTWCHazardsLayer;

var MAX_RADIUS= 15;

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

if (typeof(Cookies.get('Previous MSF Responses')) === 'undefined') {
    Cookies.set('Previous MSF Responses','off'); // default
}
if (typeof(Cookies.get('MapLayer')) === 'undefined') {
    Cookies.set('MapLayer','Terrain'); // default
}

if (typeof(Cookies.get('Ongoing MSF Responses'))==='undefined') {
    Cookies.set('Ongoing MSF Responses','on');
}

if (typeof(Cookies.get('Previous MSF Responses'))==='undefined') {
    Cookies.set('Previous MSF Responses','on');
}

if (typeof(Cookies.get('MSF Presence'))==='undefined') {
    Cookies.set('MSF Presence','off');
}

if (typeof(Cookies.get('Health Sites'))==='undefined') {
    Cookies.set('Health Sites','off');
}

if (typeof(Cookies.get('- MSF Staff'))==='undefined') {
    Cookies.set('- MSF Staff','on');
}
if (typeof(Cookies.get('- other contacts'))==='undefined') {
    Cookies.set('- other contacts','off');
}

if (typeof(Cookies.get('- PDC'))==='undefined') {
    Cookies.set('- PDC','on');
}

if (typeof(Cookies.get('- LRA Crisis'))==='undefined') {
    Cookies.set('- LRA Crisis','off');
}

if (typeof(Cookies.get('- TSR'))==='undefined') {
    Cookies.set('- TSR','on');
}
if (typeof(Cookies.get('- GDACS'))==='undefined') {
    Cookies.set('- MSF Staff','on');
}
if (typeof(Cookies.get('- PTWC'))==='undefined') {
    Cookies.set('- PTWC','on');
}
if (typeof(Cookies.get('- USGS'))==='undefined') {
    Cookies.set('- USGS','on');
}

// keep track of the first time we load missions and contacts (used in code for updating based on map extents)
var firstContactsLoad = true;
var firstMissionsLoad = true;

var reportMarkers = [];

let presenceLayer = null;

let ARCGIS_TOKEN = ''; // const but does need to be set on initial load

const getMSFPresence = function(callback) {

    //get the current bounds
    let bboxString=mainMap.getBounds().toBBoxString();
    //the url
    let url = 'https://arcgis.cartong.org/arcgis/rest/services/wrl_presence/wrl_presencemsf_view/MapServer/0/query?outFields=*&f=json&outSR=4326&inSR=4326&geometryType=esriGeometryEnvelope&geometry='+bboxString+'&token='+ARCGIS_TOKEN;

    $.getJSON(url, function( data ){
        callback(ArcgisToGeojsonUtils.arcgisToGeoJSON(data));
    }).fail(function(err) {
        alert('error: '+ err);
    });
};

let firstPresenceLoad = true;
/**
* Function to map MSF presence
* @function mapMSFPresence
* @param {Object} presence - geoJSON
**/

const mapMSFPresence = function(presence) {

    // Add popups
    function onEachFeature(feature, layer) {
        var popupContent =
              'Name: ' + feature.properties.name + '<br />' +
              'Open Date: ' + (new Date(feature.properties.open_date)).toLocaleString().replace(/:\d{2}$/,'') + '<br />' +
              'Country: ' + feature.properties.country + '<br />' +
              'Project Code: ' + feature.properties.project_code + '<br />' +
              'Intervention Type: ' + feature.properties.intervention_type + '<br />' +
              'Project Mode: ' + feature.properties.project_mode + '<br />' +
              'OC: ' + feature.properties.operational_centre;
        if (feature.properties.close_date) {
            popupContent += '<br />Close Date: '+(new Date(feature.properties.close_date)).toLocaleString().replace(/:\d{2}$/,'');
        }

        /*
          $(eventDiv).append(
              '<div class="list-group-item">' +
        'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
        'Opened: ' + (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
        'Last updated at: ' + (new Date(feature.properties.updated_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
      'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
        statusStr +
        notificationStr +
        totalPopulationStr +
        affectedPopulationStr +
        'Description: ' + feature.properties.metadata.description + '<br>' +
        '</div>'
          );
          */

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
    }

    let presenceLayerOn = mainMap.hasLayer(presenceLayer);

    if (presenceLayer)
    {
        computerTriggered=true;
        mainMap.removeLayer(presenceLayer);
        layerControl.removeLayer(presenceLayer);
        computerTriggered=false;
    }

    presenceLayer = L.geoJSON(presence, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {'radius':10, 'color':'blue'});
        },
        onEachFeature: onEachFeature
    });



    if (presenceLayerOn || firstPresenceLoad ) {
        if (Cookies.get('MSF Presence')==='on') {
            presenceLayer.addTo(mainMap);
        }
        firstPresenceLoad = false;
    }


    layerControl.addOverlay(presenceLayer, 'MSF Presence');


};

let firstLRALoad = true;
let LRALayer = null;

/**
* Function to map MSF presence
* @function mapLRAHazards
* @param {Object} hazards - geoJSON
**/

const mapLRAHazards = function(hazards) {

    // Add popups
    function onEachFeature(feature, layer) {
        var popupContent =
              'Title (community name): <a href="' + feature.properties.title + '">' + feature.properties.id + '</a><br />' +
              'Start Date: ' + (new Date(feature.properties.start_date)).toLocaleString().replace(/:\d{2}$/,'') + '<br />' +
              'Summary: ' + feature.properties.summary + '<br />' +
              'LRA Verification Rating: ' + feature.properties.lra_verification_rating + '<br />'; 
        if (feature.properties.close_date) {
            popupContent += '<br />Close Date: '+(new Date(feature.properties.close_date)).toLocaleString().replace(/:\d{2}$/,'');
        }

        /*
          $(eventDiv).append(
              '<div class="list-group-item">' +
        'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
        'Opened: ' + (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
        'Last updated at: ' + (new Date(feature.properties.updated_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
      'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
        statusStr +
        notificationStr +
        totalPopulationStr +
        affectedPopulationStr +
        'Description: ' + feature.properties.metadata.description + '<br>' +
        '</div>'
          );
          */

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
    }

    let LRALayerOn = mainMap.hasLayer(LRALayer);

    if (LRALayer)
    {
        computerTriggered=true;
        mainMap.removeLayer(LRALayer);
        layerControl.removeLayer(LRALayer);
        computerTriggered=false;
    }

    LRALayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {'radius':10, 'color':'green'});
        },
        onEachFeature: onEachFeature
    });

    if (LRALayerOn || firstLRALoad ) {
        if (Cookies.get('- LRA Crisis')==='on') {
            LRALayer.addTo(mainMap);
        }
        firstLRALoad = false;
    }

    layerControl.addOverlay(LRALayer, '- LRA Crisis', 'RSS Feeds');
};

/**
* Function to get reports for an event
* @function openReportPopup
* @param {Object} mapForReports - map to put the reports on
* @param {Object} callback - mapping callback function once reports are loaded
**/
function openReportPopup(id) {
    for (var i in reportMarkers){
        var markerID = reportMarkers[i].options.id;
        if (markerID == id) {
            mainMap.setView(reportMarkers[i].getLatLng());
            reportMarkers[i].openPopup();
            break;
        }
    }
}

/**
* Function to get feeds
**/
var getFeeds = function(url, callback) {
    $.getJSON(url, function( data ){
        callback(data.result);
    }).fail(function(err) {
        if (err.hasOwnProperty('responseText') && err.responseText.includes('expired')) {
            alert('session expired');
        }
    });
};

var HAZARD_ICON_TYPES = ['biomedical', 'cyclone', 'drought', 'earthquake', 'flood', 'volcano', 'wildfire', 'storm', 'highwind'];

/**
* Function to map from PDC hazard summary to PDC hazard icon
* @param {String} hazardSummary - hazard summary
**/
var PDCHazardIcon = function(hazardSummary) {
    var iconUrl = '/resources/images/hazards/';
    if (HAZARD_ICON_TYPES.indexOf(hazardSummary.split(' ')[0].toLowerCase())>-1) {
        iconUrl += hazardSummary.split(' ')[0].toLowerCase() + '_' +
      hazardSummary.split(' ')[1].toLowerCase().replace(/(\(|\))/g,'') +
      '.svg';
    } else {
        iconUrl += 'indeterminate.svg';
    }

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
    var popupContent = '<strong><a href=\''+feature.properties.link+'\' target=_blank>' + feature.properties.title +'</a></strong>' + '<BR>Source: '+ feature.properties.source + '<BR>Summary: '+ feature.properties.summary +'<BR>Updated: ' + (new Date(feature.properties.updated)).toLocaleString().replace(/:\d{2}$/,'');

    layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
};

var mapTSRHazards = function(hazards){

    TSRHazardsLayer = L.geoJSON(hazards, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: L.icon({
                iconUrl: '/resources/images/icons/event_types/typhoon.svg',
                iconSize: [30, 30]
            })});
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
            return L.marker(latlng, {icon: L.icon({
                iconUrl: '/resources/images/icons/event_types/tsunami.svg',
                iconSize: [30, 30]
            })});
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
        return L.icon({iconUrl:'/resources/images/hazards/indeterminate.svg', iconSize: [39,39]}); // eslint-disable-line no-console
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
            return L.marker(latlng, {icon: L.icon({
                iconUrl: '/resources/images/icons/event_types/earthquake.svg',
                iconSize: [39, 39]
            })});
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

var currentContactId = 0;
var onContactLinkClick = function(id) {
    $('#privateContactDiv').toggle(localStorage.getItem('username')!=null);
    $('#shareWithDiv').toggle(localStorage.getItem('username')!=null);
    $('#contactDetailsModal').on('shown.bs.modal');
    currentContactId = id;
    getContact(id);
};

var contactInfo = {};

var getContact = function(id) {
    $.getJSON('/api/contacts/' + id, function(contact) {
        contactInfo = contact.result ? contact.result.properties : {};
        //$('#contactDetailsModal').find('div.form-group').hide();
        $('span.private').html(
            '<select id="privateContact">'+
      '<option value="true">yes</option>' +
      '<option value="false">no</option>' +
    '</select>'
        );
        $('#privateContact').val(String(contact.result.private));
        $('#privateContact').change(function() {
            if ($('#privateContact').val() === 'true') {
                alert('cannot set public contact private');
            } else {
                $.ajax({
                    type: 'PATCH',
                    url: '/api/contacts/' + id + '/private',
                    data: JSON.stringify({'privacy': $('#privateContact').val()}),
                    contentType: 'application/json'
                }).fail(function(err) {
                    if (err.status===403) { // forbidden
                        alert('you can only set to private contacts that you have entered');
                    }
                    alert('privacy not set due to error');
                });
            }
        });

        $('span.filed').html(convertToLocaleDate(contact.result.created_at));
        $('span.updated').html(convertToLocaleDate(contact.result.updated_at));
        $('span.last_email').html(convertToLocaleDate(contact.result.last_email_sent_at));

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

$('#sharewith_email').keyup(function(event){
    if(event.keyCode == 13){
        var email = $('#sharewith_email').val();
        var url = '/api/contacts/useridbyemail/'+email;
        $.getJSON(url, function(userdata) {
            $.ajax({
                type: 'PATCH',
                url: '/api/contacts/' + currentContactId + '/share',
                data: JSON.stringify({'oid':JSON.parse(userdata.body).id}),
                contentType: 'application/json'
            }).done(function(data, textStatus, req) {
                $('#sharewith_email').val(''); // clear entry
                alert('shared');
            }).fail(function(err) {
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                } else {
                    alert('failed, are you sure you own the record?');
                }
            });
        }).fail(function(err) {
            alert('MSF user not found, check email address');
        });
    }
});

$( '#sharewith_name' ).autocomplete({
    source: function( request, response ) {
        $.ajax({
            url: '/api/contacts/usersearch/'+request.term,
            success: function( data ) {
                response($.map(JSON.parse(data.body).value, function (item) {
                    return {
                        label: item.displayName,
                        value: item.displayName,
                        id: item.id
                    };
                }));
            }
        });
    },
    minLength: 3,
    select: function( event, ui ) {
        if (ui.item) {
            $.ajax({
                type: 'PATCH',
                url: '/api/contacts/' + currentContactId + '/share',
                data: JSON.stringify({'oid':ui.item.id}),
                contentType: 'application/json'
            }).done(function(data, textStatus, req) {
                $('#sharewith_name').val(''); // clear entry
                alert('shared');
            }).fail(function(err) {
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                } else {
                    alert('failed, are you sure you own the record?');
                }
            });
        }
    },
    open: function() {
        $( this ).removeClass( 'ui-corner-all' ).addClass( 'ui-corner-top' );
    },
    close: function() {
        $( this ).removeClass( 'ui-corner-top' ).addClass( 'ui-corner-all' );
    }
});
