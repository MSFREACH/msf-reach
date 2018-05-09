/*eslint no-unused-vars: off*/

/**
* Landing page script
* @file public/resources/js/landing.js
* Show overview of MSF Reach events
*/

// Constants
var GEOFORMAT='geojson'; // use geojson as preferred goepsatial data format

// mapping from short type names to longer names
var TYPES=[{'conflict':'Conflict'}, {'natural_hazard':'Natural Disaster'},
    {'epidemiological':'Disease Outbreak'}, {'search_and_rescue':'Search & rescue'},
    {'displacement':'Displacement'}, {'malnutrition':'Malnutrition'}, {'other':'Other (detail in summary)'}
];

// setup variables to store contact layers
var MSFContactsLayer, nonMSFContactsLayer;

// set up variable to store report ID for new event creation from unassigned report
var report_id_for_new_event = null; // null = not creating event from unassigned report

// set up the severity scale slider input
$( '#inputSeverityScale' ).slider({
    value: 2, // default: 2
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


// set up the variable for holding the events layer
var eventsLayer;

/**
* Function to map and print a table of events
* @function mapAllEvents
* @param {Object} err - error object, null if no error
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
        if(typeof(feature.properties.metadata.notification)!=='undefined' && feature.properties.metadata.notification.length > 0) {
            notificationStr = 'Latest notification: ' + feature.properties.metadata.notification[feature.properties.metadata.notification.length-1].notification + '<br>';
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
            severityStr += 'Severity description: ' + feature.properties.metadata.severity + '<br>';
        }
        if (feature.properties.metadata.hasOwnProperty('severity_scale')) {
            severityStr += 'Severity scale: ' + severityLabels[feature.properties.metadata.severity_scale-1] + '<br>';
        }


        var type = feature.properties.metadata.sub_type != '' ? feature.properties.type + ',' + feature.properties.metadata.sub_type : feature.properties.type;
        var icon_name = type.includes(',') ? type.split(',')[0] : type;
        if (feature.properties.type.toLowerCase().includes('epidemiological')) {
            icon_name = 'epidemic';
        }
        if (feature.properties.type.toLowerCase().includes('natural_hazard')) {
            icon_name = feature.properties.metadata.sub_type.includes(',') ? feature.properties.metadata.sub_type.split(',')[0].toLowerCase() : feature.properties.metadata.sub_type.toLowerCase();
        }

        var popupContent = '<a href=\'/events/?eventId=' + feature.properties.id +
    '\'><img src=\'/resources/images/icons/event_types/'+icon_name+'.svg\' width=\'40\'></a>' +
    '<strong><a href=\'/events/?eventId=' + feature.properties.id +
    '\'>' + feature.properties.metadata.name +'</a></strong>' + '<br>' +
    'Opened (local time of event): ' + (feature.properties.metadata.event_datetime || feature.properties.created_at) + '<br>' +
    'Last updated at (UTC): ' + feature.properties.updated_at.split('T')[0] + '<br>' +
    'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
    statusStr +
    severityStr +
    notificationStr +
    totalPopulationStr +
    affectedPopulationStr;


        // make sure there's no trailing <br> from above
        if (popupContent.endsWith('<br>')) {
            popupContent.substr(0,popupContent.length-4);
        }

        var eventDiv = '';
        if (statusStr.toLowerCase().includes('monitoring') || statusStr.toLowerCase().includes('exploration') || statusStr.toLowerCase().includes('assessment')) {
            eventDiv = '#watchingEventProperties';
        } else {
            eventDiv = '#ongoingEventProperties';
        }
        $(eventDiv).append(
            '<div class="list-group-item">' +
      'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
      'Opened: ' + (feature.properties.metadata.event_datetime || feature.properties.created_at) + '<br>' +
      'Last updated at: ' + feature.properties.updated_at.split('T')[0] + '<br>' +
    'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
      statusStr +
      notificationStr +
      totalPopulationStr +
      affectedPopulationStr +
      '</div>'
        );

        if (feature.properties && feature.properties.popupContent) {
            popupContent += feature.properties.popupContent;
        }

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
    }

    eventsLayer = L.geoJSON(events, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: L.icon({
                iconUrl: '/resources/images/icons/event_types/open_event.svg',
                iconSize:     [50, 50], // size of the icon
                iconAnchor: [25, 50]
                //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
                //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
            })});
        },
        onEachFeature: onEachFeature
    });

    if (Cookies.get('Ongoing MSF Projects')==='on') {
        eventsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(eventsLayer, 'Ongoing MSF Projects');

};

/**
* Function to get contacts
* @function getContacts
* @param {function} callback - callback to run once contacts are fetched
* @param {String} term - search term
* @param {String} type - contact type to filter by
**/
var getContacts = function(callback,term,type){

    var url = '/api/contacts/?geoformat='+GEOFORMAT;
    if (term) {
        url += '&search='+term;
    }
    if (type) {
        url=url+'&type='+type;
    }
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
* Function to get reports for an event
* @function getReports
* @param {Object} mapForReports - map to put the reports on
* @param {Object} callback - mapping callback function once reports are loaded
**/
var getReports = function(mapForReports, callback){
    $.getJSON('/api/reports/?geoformat=' + GEOFORMAT, function( data ){
        callback(data.result, mapForReports);
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
* @function getMissions
* @param {function} callback - callback function to run once missions are loaded
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

var allFeedFeatures=[];
var totalFeedsSaved=0;

/**
* function to put the feed data into the table
* @function tableFeeds
* @param {Object} feeds - feed data (geojson format)
*/
var tableFeeds = function(feeds) {
    for(var i = 0; i <= feeds.features.length; i++) {
        allFeedFeatures.push(feeds.features[i]);
    }
    totalFeedsSaved++;
    if (totalFeedsSaved ==1)
        $('#rssFeeds').html('<div class="msf-loader"></div>');
    if (totalFeedsSaved == TOTAL_FEEDS)
    {
        $('#rssFeeds').html('');
        allFeedFeatures.sort(function(a,b){
            return new Date(b.properties.updated) - new Date(a.properties.updated);
        });
        $.each(allFeedFeatures,function(i,feature){
            if (feature) {
                $('#rssFeeds').append(
                    '<div id="rssdiv'+feature.properties.id+'" class="list-group-item rss-item" onclick="openHazardPopup(\''+feature.properties.id+'\')">' +
         'Name: <a target="_blank" href="' + feature.properties.link + '">' + feature.properties.title + '</a><br>' +
         'Source: ' + feature.properties.source + '<br>' +
         'Updated: ' + (new Date(feature.properties.updated)).toISOString().replace('T', ' ').replace('Z',' GMT') + '<br>' +
         'Summary: ' + feature.properties.summary.trim() + '<br>' +
         '</div>'
                );
            }
        });


    }

};


/**
* Function to return an icon for mission in popupContent
# @function missionPopupIcon
* @param {String} missionType - type of disaster
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
* @function mapMissions - function to map MSF Past Responses
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
            if (typeof(feature.properties.properties.notification) !== 'undefined' && feature.properties.properties.notification.length > 0) {
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

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
    }

    // MSF Icons
    var missionIcon = L.icon({
        iconUrl: '/resources/images/icons/event_types/historical.svg',

        iconSize:     [50, 50], // size of the icon
        opacity: 0.8,
        iconAnchor:   [25, 50] // point of the icon which will correspond to marker's location
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

            return new L.DivIcon({ html: '<div><span class="marker-cluster-msf-missions-text"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-missions' , iconSize: new L.Point(40, 40) });

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
                '<option value="ignored">ignored</option>' +
              '</select></td><td>' +
              '<select id="events-for-report-'+feature.properties.id+'"></select></td></tr>'
            );

            $('#report-'+feature.properties.id).val(feature.properties.status);
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



            if (!feature.properties.event_id) {
                $('#events-for-report-'+feature.properties.id).append('<option value="">Please select...</option>');
                $.getJSON('api/events', function(data) {
                    $.map(data.result.objects.output.geometries, function(item) {
                        var name = item.properties.metadata.name;
                        var event_id = item.properties.id;
                        $('#events-for-report-'+feature.properties.id).append('<option value="'+event_id+'">'+name+'</option>');
                    });
                });
                $('#events-for-report-'+feature.properties.id).append('<option value="new">new event</option>');
                $('#events-for-report-'+feature.properties.id).change(function() {
                    var selectedVal = $(this).val();
                    if (selectedVal==='new') {
                        // store report_id
                        report_id_for_new_event = $(this).attr('id').split('-').slice(-1)[0];

                        // get coordinates
                        var coordinates;

                        $.getJSON('api/reports/'+report_id_for_new_event, function(data) {
                            $.map(data.result.objects.output.geometries, function(item) {
                                // set latlng
                                latlng = L.latLng(item.coordinates.reverse());
                            });
                        });

                        // open new modal
                        $('#newEventModal').modal();
                    } else {
                        // link report to event
                        var body = {
                            event_id: selectedVal
                        };

                        $.ajax({
                            type: 'POST',
                            url: '/api/reports/linktoevent/'+$(this).attr('id').split('-').slice(-1)[0],
                            data: JSON.stringify(body),
                            contentType: 'application/json'
                        });
                    }
                });
            }
        }


        layer.bindPopup(popupContent, {  maxWidth: 'auto' });



    }

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

};

/**
* Function to add contacts to map
* @function mapContacts
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

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
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

    if (MSFContactsLayer)
    {
        computerTriggered=true;
        mainMap.removeLayer(MSFContactsLayer);
        layerControl.removeLayer(MSFContactsLayer);
        computerTriggered=false;
    }


    if (nonMSFContactsLayer)
    {
        computerTriggered=true;
        mainMap.removeLayer(nonMSFContactsLayer);
        layerControl.removeLayer(nonMSFContactsLayer);
        computerTriggered=false;
    }

    MSFContactsLayer = L.markerClusterGroup({
        maxClusterRadius:MAX_RADIUS,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            return new L.DivIcon({ html: '<div><span class="marker-cluster-msf-contacts-text"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-contacts' , iconSize: new L.Point(40, 40) });
        }
    }).addLayer(
        L.geoJSON(msfContact(contacts,true), {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: contactIcon});
            },
            onEachFeature: onEachFeature
        })
    );

    nonMSFContactsLayer = L.markerClusterGroup({
        maxClusterRadius:MAX_RADIUS,
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            return new L.DivIcon({ html: '<div><span class="marker-cluster-msf-contacts-text"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-contacts' , iconSize: new L.Point(40, 40) });
        }
    }).addLayer(L.geoJSON(msfContact(contacts,false), {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: contactIcon});
        },
        onEachFeature: onEachFeature
    })
    );

    if (Cookies.get('- MSF Staff')==='on') {
        MSFContactsLayer.addTo(mainMap);
    }
    if (Cookies.get('- other contacts')==='on') {
        nonMSFContactsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(MSFContactsLayer, '- MSF Staff', 'Contacts');
    layerControl.addOverlay(nonMSFContactsLayer, '- other contacts', 'Contacts');

};

/**
* function to show mission data modal on click
* @function onMissionLinkClick
* @param {String} id - id number (as a String)
*/
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

/**
* function to convert ISO date string to locale string with basic handling of non-isoDate format
* @function convertToLocaleDate
* @param {String} isoDate - ISO date string
*/
var convertToLocaleDate= function (isoDate) {
    if (isoDate)
        return (new Date(isoDate)).toLocaleString();
    else
        return '';
};

// Create map
var mainMap = L.map('mainMap',{dragging: !L.Browser.mobile, tap:false, doubleClickZoom:false});

// To get healthsites loaded, need to first add load event and then setView separately

mainMap.on('load', function(loadEvent) {
    getHealthSites(mainMap.getBounds(),mapHealthSites);
});

mainMap.fitBounds([[-13, 84],[28,148]]);
mainMap.setMaxBounds([[-15, 86],[26,150]]);

mainMap.on('zoomend', function(zoomEvent)  {
    getHealthSites(mainMap.getBounds(),mapHealthSites);
});


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
case 'Satellite':
    mapboxSatellite.addTo(mainMap);
    break;
case 'Terrain':
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
    'RSS Feeds': {},
    'Contacts': {}
};

var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

var overlayMaps = {};

var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, groupOptions).addTo(mainMap);

// get and map data:
getAllEvents(mapAllEvents);
getReports(mainMap, mapReports);
getFeeds('/api/hazards/pdc',mapPDCHazards);
getFeeds('/api/hazards/tsr',mapTSRHazards);
getFeeds('/api/hazards/usgs',mapUSGSHazards);
getFeeds('/api/hazards/gdacs',mapGDACSHazards);
getFeeds('/api/hazards/ptwc',mapPTWCHazards);
//getMissions(mapMissions);
getContacts(mapContacts);
getFeeds('/api/hazards/pdc', tableFeeds);
getFeeds('/api/hazards/usgs', tableFeeds);
getFeeds('/api/hazards/tsr', tableFeeds);
getFeeds('/api/hazards/gdacs', tableFeeds);
getFeeds('/api/hazards/ptwc', tableFeeds);
var TOTAL_FEEDS=5;

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

var autocompleteMap=mainMap;

var latlng = null;

mainMap.on('dblclick', function(dblclickEvent) {
    latlng = dblclickEvent.latlng;
    $('#newEventModal').modal('show');
});

$('#contSearchTerm').on('input',function(){
    if ($('#inputContactType').val()!=='') {
        getContacts(mapContacts,this.value,$('#inputContactType').val());
    } else {
        getContacts(mapContacts,this.value);
    }

});

$('#inputContactType').on('change',function(){
    if ($('#contSearchTerm').val()!=='') {
        getContacts(mapContacts,$('#contSearchTerm').val(),this.value);
    } else {
        getContacts(mapContacts,null,this.value);
    }
});

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
