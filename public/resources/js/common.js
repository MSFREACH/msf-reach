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
        result += ', ';
        result += sub_type ? (sub_type.replace(/_/g,' ').replace(/,/g,', ')) : '';
    } else {
        result += sub_type ? (sub_type.replace(/_/g,' ').replace(/,/g,', ')) : '';
    }
    return result;
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

var computerTriggered = false;

var PDCHazardsLayer;
var TSRHazardsLayer;
var USGSHazardsLayer;
var GDACSHazardsLayer;
var PTWCHazardsLayer;

var MAX_RADIUS= 250;

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

if (typeof(Cookies.get('Mission Histories')) === 'undefined') {
    Cookies.set('Mission Histories','off'); // default
}
if (typeof(Cookies.get('MapLayer')) === 'undefined') {
    Cookies.set('MapLayer','Terrain'); // default
}

if (typeof(Cookies.get('Ongoing MSF Projects'))==='undefined') {
    Cookies.set('Ongoing MSF Projects','on');
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

    layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
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
        return L.icon({'iconUrl':'404.svg'}); // eslint-disable-line no-console
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

/**
* Function to add reports to map
* @param {Object} reports - GeoJson FeatureCollection containing report points
**/
var mapReports = function(reports,mapForReports){

    $('#reportsContainer').html(
        '<table class="table table-hover" id="reportsTable"><thead><tr><th>Open</th><th>Type</th><th>Description</th><th>Reporter</th><th>Reported time</th><th>Status</th></thead><tbody>'
    );

    function onEachFeature(feature, layer) {

        var popupContent = '';
        var reportsTableContent = '';

        if (feature.properties && feature.properties.content) {
            popupContent += 'Decription: '+ feature.properties.content.description + '<BR>';
            popupContent += 'Tag: '+ feature.properties.content.report_tag + '<BR>';
            popupContent += 'Reporter: ' + feature.properties.content['username/alias'] + '<BR>';
            popupContent += 'Reported time: ' + feature.properties.created + '<BR>';
            if (feature.properties.content.image_link && feature.properties.content.image_link.length > 0){
                if (feature.properties.content.image_labels) {
                    popupContent += 'AI image labels: ';
                    feature.properties.content.image_labels.forEach((item) => { popupContent += item.Name + ', ';});
                    popupContent = popupContent.substring(0,popupContent.length-2);
                    popupContent += '<BR>';
                }
                popupContent += '<img src="'+feature.properties.content.image_link+'" height="140">';
            }



            $('#reportsTable').append(
                '<tr><td><a href=\'#\' onclick=\'openReportPopup(' +
              feature.properties.id +
              ')\' class=\'contact-link btn btn-sm btn-primary\' title=\'Quick View\'><i class=\'glyphicon glyphicon-eye-open\'></i></a></td><td>' +
              feature.properties.content.report_tag +
              '</td><td>' +
              feature.properties.content.description +
              '</td><td>' +
              feature.properties.content['username/alias'] +
              '</td><td>' +
              feature.properties.created.replace('T',' ') +
              '</td><td>' +
              '<select id="report-'+feature.properties.id+'">'+
                '<option value="unconfirmed">unconfirmed</option>' +
                '<option value="confirmed">confirmed</option>' +
              '</select></td></tr>'

            );
            $('#report-'+feature.properties.id).val(feature.properties.status === 'confirmed' ? 'confirmed' : 'unconfirmed');
            $('#report-'+feature.properties.id).change(function() {
                var selectedVal = $(this).val();
                var id = $(this).attr('id').split('-')[1];
                var body = {
                    status: selectedVal,
                    content: {} // no updates to content
                };

                $.ajax({
                    type: 'POST',
                    url: '/api/reports/'+id,
                    data: JSON.stringify(body),
                    contentType: 'application/json'
                });
            });

        }

        $('#reportsTable').append('</tbody></table>');



        layer.bindPopup(popupContent, {  maxWidth: 'auto' });
    }

    var points = []; // local storage for coordinates of reports (used for map bounds)

    // MSF Icons
    const accessIcon = L.icon({
        iconUrl: '/resources/images/icons/reports/access_icon.svg',
        iconSize:     [60, 60], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

    const securityIcon = L.icon({
        iconUrl: '/resources/images/icons/reports/security_icon.svg',
        iconSize:     [60, 60], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

    const contactsIcon = L.icon({
        iconUrl: '/resources/images/icons/reports/contacts_icon.svg',
        iconSize:     [60, 60], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

    const needsIcon = L.icon({
        iconUrl: '/resources/images/icons/reports/needs_icon.svg',
        iconSize:     [60, 60], // size of the icon
        iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor

    });

    accessLayer = L.geoJSON(reports, {
        filter: function (feature) {
            return (feature.properties.content.report_tag === 'ACCESS');
        },
        pointToLayer: function (feature, latlng) {
            points.push([latlng.lat, latlng.lng]);
            marker = L.marker(latlng, {icon: accessIcon, id: feature.properties.id});
            reportMarkers.push(marker);
            return marker;
        },
        onEachFeature: onEachFeature
    });
    if (Cookies.get('- access')==='on') {
        accessLayer.addTo(mapForReports);
    }
    layerControl.addOverlay(accessLayer, '- access', 'Reports');

    needsLayer = L.geoJSON(reports, {
        filter: function (feature) {
            return (feature.properties.content.report_tag === 'NEEDS');
        },
        pointToLayer: function (feature, latlng) {
            points.push([latlng.lat, latlng.lng]);
            marker = L.marker(latlng, {icon: needsIcon, id: feature.properties.id});
            reportMarkers.push(marker);
            return marker;
        },
        onEachFeature: onEachFeature
    });
    if (Cookies.get('- needs')==='on') {
        needsLayer.addTo(mapForReports);
    }
    layerControl.addOverlay(needsLayer, '- needs', 'Reports');

    securityLayer = L.geoJSON(reports, {
        filter: function (feature) {
            return (feature.properties.content.report_tag === 'SECURITY');
        },
        pointToLayer: function (feature, latlng) {
            points.push([latlng.lat, latlng.lng]);
            marker = L.marker(latlng, {icon: securityIcon, id: feature.properties.id});
            reportMarkers.push(marker);
            return marker;
        },
        onEachFeature: onEachFeature
    });
    if (Cookies.get('- security')==='on') {
        securityLayer.addTo(mapForReports);
    }
    layerControl.addOverlay(securityLayer, '- security', 'Reports');

    reportsContactsLayer = L.geoJSON(reports, {
        filter: function (feature) {
            return (feature.properties.content.report_tag === 'CONTACTS');
        },
        pointToLayer: function (feature, latlng) {
            points.push([latlng.lat, latlng.lng]);
            marker = L.marker(latlng, {icon: contactsIcon, id: feature.properties.id});
            reportMarkers.push(marker);
            return marker;
        },
        onEachFeature: onEachFeature
    });
    if (Cookies.get('- contacts')==='on') {
        reportsContactsLayer.addTo(mapForReports);
    }
    layerControl.addOverlay(reportsContactsLayer, '- contacts', 'Reports');

    if (points.length > 0){
        mapForReports.fitBounds(points, {padding: [200,200]});
    }

};

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
        $('#privateContact').val(contact.result.private);

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
                }
            });
        }).fail(function(err) {
            alert('MSF user not found, check email address');
        });
    }
});

$('#privateContact').change(function() {
    $.ajax({
        type: 'PATCH',
        url: '/api/contacts/' + currentContactId + '/private',
        data: JSON.stringify({'privacy': $('#privateContact').val()}),
        contentType: 'application/json'
    }).fail(function(err) {
        alert('privacy not set due to error');
    });
});
