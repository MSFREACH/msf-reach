/*eslint no-unused-vars: off*/

/**
* Events page script
* @file public/resources/js/events.js
* Display and interact with event objects from events page
*/

// Constants
var GEOFORMAT = 'geojson'; // Change to topojson for prod
var WEB_HOST = location.protocol+'//'+location.host+'/';
var EVENT_PROPERTIES = ['id', 'status', 'type', 'created'];
var MAX_RADIUS= 5;


var mainMap = L.map('map').setView([-6.8, 108.7], 7);

var computerTriggered = false;

var firstContactsLoad = true;
var firstMissionsLoad = true;

var zoomToEvent = function(latlng) {
    mainMap.setView(latlng, 5);
};

var clipboard = new Clipboard('.btn');

var labels = {
    'exploratory_details': 'Exploratory details',
    'operational_center': 'Operational Center',
    'other_orgs': 'Other organisations',
    'capacity': 'Capacity',
    'deployment': 'Deployment details',
    'name': 'Event name',
    'region': 'Region',
    'incharge_position': 'In charge position',
    'incharge_name': 'In charge name',
    'sharepoint_link': 'SharePoint Link',
    'msf_response_medical_material_total': 'Number of medical supplies',
    'msf_response_non_medical_material_total': 'Number of non-medical supplies',
    'ext_capacity_who': 'Ext capacity on the ground (name)'
};

var unpackMetadata = function(metadata) {
    var result = '';
    for (var property in metadata) {
        if(labels.hasOwnProperty(property)) {
            result += '<dt>'+labels[property]+':</dt><dd>'+metadata[property]+'</dd>';
        }
    }
    if (metadata.hasOwnProperty('percentage_population_affected')) {
        if (metadata.percentage_population_affected!=='NaN') {
            result += '<dt>percentage_population_affected: </dt><dd>'+metadata.percentage_population_affected+'</dd>';
        }
    }
    if (metadata.hasOwnProperty('msf_resource_visa_requirement')) {
        result += '<dt>Visa requirement:</dt>';
        $.each(metadata.msf_resource_visa_requirement.nationality,function(i,val){
            if(val)
                result += '<dd>'+val.name+', <i>required</i>: '+val.is_required+'</dd>';
        });
        if (metadata.msf_resource_visa_requirement.description)
            result += '<dd> Description: '+ metadata.msf_resource_visa_requirement.description+'</dd>';
    }
    if (metadata.hasOwnProperty('msf_response_medical_material')) {
        result += '<dt>Medical requirements:</dt><dd>';
        for (var i =0; i < metadata.msf_response_medical_material.length; i++) {
            result += metadata.msf_response_medical_material[i] + '<br>';
        }
        result += '</dd>';
        result += '<dt>Number of medical requirements:</dt><dd>' + metadata.msf_response_medical_material_total +'</dd>';
        if (metadata.hasOwnProperty('msf_response_non_medical_material_date_arrival') && metadata.msf_response_non_medical_material_date_arrival && metadata.msf_response_non_medical_material_date_arrival.includes('T')) {
            result += '<dt>Arrival of non-medical requirements:</dt><dd>' + metadata.msf_response_non_medical_material_date_arrival.split('T')[0]+'</dd>';
        }
    }
    if (metadata.hasOwnProperty('msf_response_non_medical_material')) {
        result += '<dt>Medical requirements:</dt><dd>';
        for (var i =0; i < metadata.msf_response_non_medical_material.length; i++) { // eslint-disable-line no-redeclare
            result += metadata.msf_response_non_medical_material[i] + '<br>';
        }
        result += '</dd>';
        result += '<dt>Number of non-medical requirements:</dt><dd>' + metadata.msf_response_non_medical_material_total +'</dd>';
        if (metadata.hasOwnProperty('msf_response_non_medical_material_date_arrival') && metadata.msf_response_non_medical_material_date_arrival && metadata.msf_response_non_medical_material_date_arrival.includes('T')) {
            result += '<dt>Arrival of non-medical requirements:</dt><dd>' + metadata.msf_response_non_medical_material_date_arrival.split('T')[0]+'</dd>';
        }
    }
    else {
        if (metadata.hasOwnProperty('nonMedicalMaterials')) {
            result += '<dt>Medical Materials</dt><dd>'+metadata.nonMedicalMaterials+'</dd>';
        }
    }
    return result;
};

/**
* Function to return an icon for mission in popupContent
* @param {String} type - type of disaster
**/
var missionPopupIcon = function(missionType) {
    if (typeof(missionType) === 'undefined') {
        return '';
    }
    var type = missionType.toLowerCase();
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
        return missionType + '<br />'; // just return text in this case
    }
    html += '.svg" width="40">';

    return html;
};


var reduceNotificationArray = function(acc, elem) {
    return acc + '<tr><td>'+(new Date(elem.notification_time*1000)).toLocaleString() + '</td><td>' + elem.notification + '</td></tr>';
};

/**
* Function to print a list of event details to web page
* @param {Object} eventProperties - Object containing event details
*/
var printEventProperties = function(err, eventProperties){


    // Make a global store of current event properties
    currentEventProperties = eventProperties;
    console.log('hereeee');
    vmEventDetails.event= $.extend(true, defaultEvent, currentEventProperties);
    vmEventDetails.$mount('#eventVApp');

    if (currentEventProperties.metadata.country) {
        $.getJSON({
            url: '/resources/js/country-to-language-mapping.json'
        }).done(function(result) {
            $.each(result.countries[currentEventProperties.metadata.country], function(index, item) {
                if (index == result.countries[currentEventProperties.metadata.country].length-1) {
                    $('#translationSuggestedLanguages').append(item.name);
                } else {
                    $('#translationSuggestedLanguages').append(item.name+', ');
                }
            });
        });
    }

    //patch to support current data for multiple nationality
    if (currentEventProperties.metadata.msf_resource_visa_requirement)
    {
        if (! ((currentEventProperties.metadata.msf_resource_visa_requirement.nationality) instanceof Array))
            currentEventProperties.metadata.msf_resource_visa_requirement.nationality=[{
                iso2: currentEventProperties.metadata.msf_resource_visa_requirement.nationality.iso2 || 'xx',
                name: currentEventProperties.metadata.msf_resource_visa_requirement.nationality.name || null,
                is_required: currentEventProperties.metadata.msf_resource_visa_requirement.nationality || 'yes'
            }];
    }

    // Add to Twitter search "AI"
    $(document).ready(function(){
        var searchTerm = '';
        if (currentEventProperties) {
            if (currentEventProperties.metadata.name) {
                if (currentEventProperties.metadata.name.includes('_')) {
                    elements = currentEventProperties.metadata.name.split('_');
                    for (var i = 0; i < elements.length-1; i++) {
                        searchTerm += elements[i] + ' ';
                    }
                } else {
                    searchTerm = currentEventProperties.metadata.name;
                }
            } else {
                if (currentEventProperties.hasOwnProperty('type')) {
                    searchTerm = currentEventProperties.type.replace(',','');
                }
                if (currentEventProperties.hasOwnProperty('sub_type')) {
                    searchTerm = currentEventProperties.metadata.sub_type.replace(',','');
                }
                if (currentEventProperties.metadata.hasOwnProperty('event_datetime')) {
                    searchTerm += ' ' + currentEventProperties.metadata.event_datetime;
                }
            }
            if (currentEventProperties.metadata.hasOwnProperty('country')) {
                searchTerm += ' ' + currentEventProperties.metadata.country;
            }
            $('#searchTerm').val(searchTerm);
        }
        $('#btnSearchTwitter').trigger('click');

        $('#searchTerm').keyup(function(event){
            if(event.keyCode == 13){
                $('#btnSearchTwitter').trigger('click');
            }
        });

    });

    // If called with err, print that instead
    if (err){
        $('#eventProperties').append(err);
    } else {

        // Pre-fil edit modal
        $('#inputName').val(eventProperties.metadata.name);
        if (typeof(eventProperties.metadata.event_status)!=='undefined') {
            $('#inputStatus').val('monitoring');
        } else {
            $('#inputStatus').val(eventProperties.metadata.event_status);
        }
        //    $('#inputSummary').val(eventProperties.metadata.summary);
        //    $('#inputPracticalDetails').val(eventProperties.metadata.practical_details);
        $('#inputSecurityDetails').val(eventProperties.metadata.security_details);
        if (typeof(eventProperties.metadata.notification)!=='undefined' && eventProperties.metadata.notification.length > 0) {
            $('#inputNotification').val(eventProperties.metadata.notification[eventProperties.metadata.notification.length-1].notification);
        }


        //    $("#eventSummary").append(eventProperties.metadata.summary);
        //    $("#eventPracticalDetails").append(eventProperties.metadata.practical_details);
        $('#eventSecurityDetails').append(eventProperties.metadata.security_details);




        if (typeof(eventProperties.metadata.notification) !== 'undefined' && eventProperties.metadata.notification.length > 0 ) {

            $('#eventNotifications').append('<table class="table"><thead><tr><td>Time</td><td>Notification</td></tr></thead><tbody>'+eventProperties.metadata.notification.reduceRight(reduceNotificationArray,'')+'</tbody></table>');

        }
        var extra_metadata = unpackMetadata(eventProperties.metadata);


        $('#eventExtra').append(extra_metadata);

    }
    if (currentEventProperties) {
        if (currentEventProperties.metadata.saved_tweets && currentEventProperties.metadata.saved_tweets.length > 0) {
            $.each(currentEventProperties.metadata.saved_tweets, function(key, value){
                $('#savedTweets').prepend('<div id="'+value.tweetId+'">'+value.html+'</div>');
                var tweetEventReportLink = eventReportLink.replace('&', '%26');
                $('#'+value.tweetId).append('<a class="btn btn-primary" href="https://twitter.com/intent/tweet?in_reply_to='+value.tweetId+'&text=Please+send+further+information+'+tweetEventReportLink+'">Reply</a><hr>');
                twttr.widgets.load();
            });
        }
    }
};

/**
* Function to get event details from API
* @param {Number} eventId - Unique event ID to fetch
* @param {Function} callback - Function to call once data returned
* @returns {String} err - Error message if any, else none
* @returns {Object} eventProperties - Event properties unless error
*/
var currentEventGeometry = null;
var getEvent = function(eventId, callback){
    $.getJSON('/api/events/' + eventId + '?geoformat=' + GEOFORMAT, function ( data ){
    // Zoom to location
        zoomToEvent([data.result.features[0].geometry.coordinates[1],data.result.features[0].geometry.coordinates[0]]);
        // Print output to page
        currentEventGeometry = data.result.features[0].geometry;
        callback(null, data.result.features[0].properties);
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            // Catch condition where no data returned
            callback(err.responseText, null);
        }
    });
};

/**
* Function to get reports for an event
* @param {Number} eventId - UniqueId of event
**/
var getReports = function(eventId, callback){
    $.getJSON('/api/reports/?eventId=' + eventId + '&geoformat=' + GEOFORMAT, function( data ){
        callback(data.result);
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
};

var reportMarkers = [];

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
* Function to add reports to map
* @param {Object} reports - GeoJson FeatureCollection containing report points
**/
var mapReports = function(reports){

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
        accessLayer.addTo(mainMap);
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
        needsLayer.addTo(mainMap);
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
        securityLayer.addTo(mainMap);
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
        reportsContactsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(reportsContactsLayer, '- contacts', 'Reports');

    if (points.length > 0){
        mainMap.fitBounds(points, {padding: [200,200]});
    }

};

/**
* Function to add contacts to map
* @param {Object} contacts - GeoJson FeatureCollection containing contact points
**/
var mapContacts = function(contacts) {

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

    // MSF Icons
    var contactIcon = L.icon({
        iconUrl: '/resources/images/icons/contacts/Contact_Red-42.svg',

        iconSize:     [36, 36], // size of the icon
    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
    });

    var contactsLayerOn = mainMap.hasLayer(contactsClusters);

    if (contactsClusters)
    {
        computerTriggered=true;
        mainMap.removeLayer(contactsClusters);
        layerControl.removeLayer(contactsClusters);
        computerTriggered=false;
    }

    contactsClusters = L.markerClusterGroup({
        maxClusterRadius:MAX_RADIUS,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();

            return new L.DivIcon({ html: '<div><span style="color:white;"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-contacts' , iconSize: new L.Point(40, 40) });

        }
    });


    contactsLayer = L.geoJSON(contacts, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: contactIcon});
        },
        onEachFeature: onEachFeature
    });

    contactsClusters.addLayer(contactsLayer);

    if (contactsLayerOn || firstContactsLoad) {
        if (Cookies.get('Contacts')==='on') {
            contactsClusters.addTo(mainMap);
        }
        firstContactsLoad = false;
    }
    layerControl.addOverlay(contactsClusters, 'Contacts');

};

/**
* Function to get contacts
**/
var initGetContacts = function(callback){
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
var initGetMissions = function(callback){
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
                popupContent += 'Latest notification: ' + feature.properties.properties.notification[feature.properties.properties.notification.length-1].notification + '<BR>';
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

    var missionsLayerOn = mainMap.hasLayer(missionsClusters);

    if (missionsClusters)
    {
        computerTriggered=true;
        mainMap.removeLayer(missionsClusters);
        layerControl.removeLayer(missionsClusters);
        computerTriggered=false;
    }

    missionsClusters = L.markerClusterGroup({
        maxClusterRadius:MAX_RADIUS,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();

            return new L.DivIcon({ html: '<div><span style="color:black;"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-missions' , iconSize: new L.Point(40, 40) });

        }
    });


    missionsLayer = L.geoJSON(missions, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: missionIcon});
        },
        onEachFeature: onEachFeature
    });


    missionsClusters.addLayer(missionsLayer);

    if (missionsLayerOn || firstMissionsLoad ) {
        if (Cookies.get('Missions')==='on') {
            missionsClusters.addTo(mainMap);
        }
        firstMissionsLoad = false;
    }


    layerControl.addOverlay(missionsClusters, 'Missions');

};


// Main function (effective)
// Get eventId from URL
currentEventId = getQueryVariable('eventId');
// Only ask API where event is specified and not empty
if (currentEventId !== false && currentEventId != ''){
    getEvent(currentEventId, printEventProperties);
    getReports(currentEventId, mapReports);
    //initGetContacts(mapContacts);
    //initGetMissions(mapMissions);
} else {
    // Catch condition where no event specified, print to screen
    printEventProperties('No event ID specified', null);
}

// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
});

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

// OSM HOT tiles
var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
});

switch (Cookies.get('MapLayer')) {
case 'satellite':
    mapboxSatellite.addTo(mainMap);
    break;
case 'terrain':
    mapboxTerrain.addTo(mainMap);
    break;
default:
    OpenStreetMap_HOT.addTo(mainMap);
}

var baseMaps = {
    'Terrain': mapboxTerrain,
    'Satellite' : mapboxSatellite,
    'Humanitarian': OpenStreetMap_HOT
};

mainMap.on('baselayerchange', function(baselayer) {
    Cookies.set('MapLayer',baselayer.name);
});

var groupedOverlays = {
    'Reports': {},
};

var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, groupOptions).addTo(mainMap);

// Archive support
$('#btnArchive').click(function(e){

    var body = {
        'status':'inactive',
        'metadata':{}
    };

    $.ajax({
        type: 'PUT',
        url: '/api/events/' + currentEventId,
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
        window.location.href = '/';
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
});

// Edit support
$('#btnSaveEdits').click(function(e){

    if (currentEventProperties.metadata.hasOwnProperty('notification') && currentEventProperties.metadata.notification.length > 0) {
        currentEventProperties.metadata.notification.push({'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val()});
    } else {
        currentEventProperties.metadata.notification = [{'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val()}];
    }

    var body = {
        'status':$('#inputStatus').val()==='complete' ? 'complete' : 'active',
        'metadata':{
            'name': $('#inputName').val(),
            'notification': currentEventProperties.metadata.notification,
            'event_status': $('#inputStatus').val(),
            //      "summary": $("#inputSummary").val(),
            //      "practical_details": $("#inputPracticalDetails").val(),
            'security_details': $('#inputSecurityDetails').val(),
            'user_edit': localStorage.getItem('username')
        }
    };

    $.ajax({
        type: 'PUT',
        url: '/api/events/' + currentEventId,
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
    //$('#editModal').modal('toggle'); // toggling doesn't refresh data on page.
        window.location.href = '/events/?eventId=' + currentEventId;
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
});

var onEditEvent = function() {
    $( '#eventModalContent' ).load( '/events/edit.html' );
};

var onArchiveEvent = function() {
    $( '#archiveEventModalContent' ).load( '/events/archive.html' );
};

mainMap.on('overlayadd', function (layersControlEvent) {
    if (!computerTriggered) {
        Cookies.set(layersControlEvent.name,'on');
    }
});


mainMap.on('overlayremove', function (layersControlEvent) {
    if (!computerTriggered) {
        Cookies.set(layersControlEvent.name,'off');
    }
});

getFeeds('/api/hazards/pdc',mapPDCHazards);
getFeeds('/api/hazards/tsr',mapTSRHazards);
getFeeds('/api/hazards/usgs',mapUSGSHazards);
getFeeds('/api/hazards/gdacs',mapGDACSHazards);
getFeeds('/api/hazards/ptwc',mapPTWCHazards);


// Enter an API key from the Google API Console:
//   https://console.developers.google.com/apis/credentials
const GoogleApiKey = 'AIzaSyAhhKWjsykF_ljVvn-P1o4l6aeE0tGjZOI';

// Set endpoints
const GoogleEndpoints = {
    translate: '',
    detect: 'detect',
    languages: 'languages'
};

// Abstract API request function
function makeApiRequest(endpoint, data, type, authNeeded) {
    url = 'https://www.googleapis.com/language/translate/v2/' + endpoint;
    url += '?key=' + GoogleApiKey;

    // If not listing languages, send text to translate
    if (endpoint !== GoogleEndpoints.languages) {
        url += '&q=' + encodeURI(data.textToTranslate);
    }

    // If translating, send target language
    if (endpoint === GoogleEndpoints.translate) {
        url += '&target=' + data.targetLang;
    }

    // Return response from API
    return $.ajax({
        url: url,
        type: type || 'GET',
        data: data ? JSON.stringify(data) : '',
        dataType: 'json',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}

// Translate
function translate(data) {
    makeApiRequest(GoogleEndpoints.translate, data, 'GET', false).then(function(
        resp
    ) {
        if (resp.data.translations[0].translatedText === 'undefined' || resp.data.translations[0].translatedText == '') {
            $('#searchTerm').val(data.textToTranslate); // just return original
        } else {
            $('#searchTerm').val(resp.data.translations[0].translatedText);
            $('#btnSearchTwitter').trigger('click');
        }
    });
}

// On document ready
$(function() {
    window.makeApiRequest = makeApiRequest;
    var translationObj = {};

    $('#translateLanguageSelection')
    // Bind translate function to translate button
        .on('change', function() {
            var translateObj = {
                textToTranslate: $('searchTerm').val(),
                targetLang: $(this).val()
            };


            translate(translateObj);
        });
});

var vmEventDetails = new Vue({

  data: {
    name: 'test',
    event: $.extend(true, defaultEvent, currentEventProperties),
    severityColors: severityColors,
    severityTexts: severityTexts
  },
  mounted:function(){
    console.log('mounted here');
    console.log(this.event);

  },
  computed:{
    notStr:function(){
      return (this.event.metadata.notification.length > 0) ? this.event.metadata.notification[this.event.metadata.notification.length-1].notification+' @ ' + (new Date(this.event.metadata.notification[this.event.metadata.notification.length-1].notification_time*1000)).toLocaleString() : '(none)';
    },
    eventLink:function(){
      return WEB_HOST + 'events/?eventId=' + this.event.id;
    },
    eventReportLink:function()
    {
      return WEB_HOST + 'report/?eventId=' + this.event.id + '&reportkey=' + this.event.reportkey;
    }
  }
});
