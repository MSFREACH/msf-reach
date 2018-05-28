/*eslint no-unused-vars: off*/

/**
* Events page script
* @file public/resources/js/events.js
* Display and interact with event objects from events page
*/


var WEB_HOST = location.protocol+'//'+location.host+'/';
var EVENT_PROPERTIES = ['id', 'status', 'type', 'created'];


var clipboard = new Clipboard('.btn');

clipboard.on('success', function(e) {
    alert('link copied to your clipboard, ready to share');
});

// set up the map:
var mainMap = L.map('map',{dragging: !L.Browser.mobile, tap:false});

mainMap.on('load', function(loadEvent) {
    getHealthSites(mainMap.getBounds(),mapHealthSites);
});

mainMap.setView([-6.8, 108.7], 7);


mainMap.on('zoomend', function(zoomEvent)  {
    getHealthSites(mainMap.getBounds(),mapHealthSites); // load healthsites based on map bounds on each zoom / pan event
});


//Bind Autocomplete to inputs:
function bindAutocompletes()
{
    if ((!google)||(!google.maps))
    {
        setTimeout(bindAutocompletes,200);
        //console.log('not ready, retrying in 0.2s...');
        return;
    }
    bindACInputToMap(mainMap,'eventAddress');
}

bindAutocompletes();

/**
* function for zooming to a point
* @function zoomToEventPoint
* @param {Object} latlng - coords to zoom to, Leaflet latlng object http://leafletjs.com/reference-1.3.0.html#latlng
*/
var zoomToEventPoint = function(latlng) {
    mainMap.setView(latlng, 5);
};

/**
* function for zooming to event bounds (coming out of event data)
* @function zoomToEventBounds
* @param {Object} bounds - coords to zoom to, object with ._southWest etc bounds
*/
var zoomToEventBounds = function(bounds) {
    var rBounds = L.latLngBounds(L.latLng(bounds._southWest.lat,bounds._southWest.lng),L.latLng(bounds._northEast.lat,bounds._northEast.lng));
    mainMap.fitBounds(rBounds);
};

// long form of labels:
var labels = {
    'exploratory_details': 'Exploratory details',
    'other_orgs': 'Other organisations',
    'capacity': 'Capacity',
    'deployment': 'Deployment details',
    'region': 'Region',
    'incharge_position': 'In charge position',
    'incharge_name': 'In charge name'
};

/**
* function for unpacking metadata into a table
* @function unpackMetadata
* @param {Object} metadata - metadata to transform into html table elements
*/

var unpackMetadata = function(metadata) {
    var result = '';
    for (var property in metadata) {
        if(labels.hasOwnProperty(property)) {
            result += '<dt>'+labels[property]+':</dt><dd>'+metadata[property]+'</dd>';
        }
    }

    if (!(metadata.hasOwnProperty('msf_response_non_medical_material'))) {
        if (metadata.hasOwnProperty('nonMedicalMaterials')) {
            result += '<dt>Medical Materials</dt><dd>'+metadata.nonMedicalMaterials+'</dd>';
        }
    }
    return result;
};

/**
* Function to return an icon for mission in popupContent
* @function missionPopupIcon
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

/**
* Function for map reduction of notification array
* @function reduceNotificationArray
* @param {String} acc - accumulator
* @param
var reduceNotificationArray = function(acc, elem) {
    return acc + '<tr><td>'+(new Date(elem.notification_time*1000)).toLocaleString() + '</td><td>' + elem.notification + '</td></tr>';
};

/**
* Function to print a list of event details to web page
* @function printEventProperties
* @param {Object} eventProperties - Object containing event details
* @param {Object} err - error object, null if no error
*/
var printEventProperties = function(err, eventProperties){


    // Make a global store of current event properties
    currentEventProperties = eventProperties;
    vmEventDetails.defEvent= $.extend(true,{},defaultEvent);
    vmEventDetails.event= $.extend(true, vmEventDetails.defEvent, currentEventProperties);
    vmEventDetails.$mount('#eventVApp');
    eventReportLink= WEB_HOST + 'report/?eventId=' + eventProperties.id + '&reportkey=' + eventProperties.reportkey;

    $('#eventShareButtons').html('<div class="sharethis-inline-share-buttons" data-url="'+window.location+'" data-title="I am sharing a link to a MSF REACH event:"></div>');
    $('#reportShareButtons').html('<div class="sharethis-inline-share-buttons" data-url="'+vmEventDetails.eventReportLink+'" data-title="Please send a report to MSF REACH with this link:"></div>');
    $.getScript('//platform-api.sharethis.com/js/sharethis.js#property=5b0343fb6d6a0b001193c2b7&product=custom-share-buttons').done( function(s) {


        setTimeout(function() {
            $('#eventCopyButton').append(
                '<div class="st-btn st-last" data-network="sharethis" style="display: inline-block;">'+
          '<button data-clipboard-text="'+window.location+'" class="btn btn-primary">'+
          '<svg fill="#fff" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40"><g><path d="m30 26.8c2.7 0 4.8 2.2 4.8 4.8s-2.1 5-4.8 5-4.8-2.3-4.8-5c0-0.3 0-0.7 0-1.1l-11.8-6.8c-0.9 0.8-2.1 1.3-3.4 1.3-2.7 0-5-2.3-5-5s2.3-5 5-5c1.3 0 2.5 0.5 3.4 1.3l11.8-6.8c-0.1-0.4-0.2-0.8-0.2-1.1 0-2.8 2.3-5 5-5s5 2.2 5 5-2.3 5-5 5c-1.3 0-2.5-0.6-3.4-1.4l-11.8 6.8c0.1 0.4 0.2 0.8 0.2 1.2s-0.1 0.8-0.2 1.2l11.9 6.8c0.9-0.7 2.1-1.2 3.3-1.2z"></path></g></svg>'+
          '</div>'
            );
            $('#reportCopyButton').append(
                '<div class="st-btn st-last" data-network="sharethis" style="display: inline-block;">'+
          '<button data-clipboard-text="'+vmEventDetails.eventReportLink+'" class="btn btn-primary">'+
          '<svg fill="#fff" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40"><g><path d="m30 26.8c2.7 0 4.8 2.2 4.8 4.8s-2.1 5-4.8 5-4.8-2.3-4.8-5c0-0.3 0-0.7 0-1.1l-11.8-6.8c-0.9 0.8-2.1 1.3-3.4 1.3-2.7 0-5-2.3-5-5s2.3-5 5-5c1.3 0 2.5 0.5 3.4 1.3l11.8-6.8c-0.1-0.4-0.2-0.8-0.2-1.1 0-2.8 2.3-5 5-5s5 2.2 5 5-2.3 5-5 5c-1.3 0-2.5-0.6-3.4-1.4l-11.8 6.8c0.1 0.4 0.2 0.8 0.2 1.2s-0.1 0.8-0.2 1.2l11.9 6.8c0.9-0.7 2.1-1.2 3.3-1.2z"></path></g></svg>'+
          '</div>'
            );

        },100);});



    if (currentEventProperties.metadata.country) {
        getEventsByCountry(currentEventProperties.metadata.country, mapAllEvents);
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

var currentEventGeometry = null; // for storing current event geometry

/**
* Function to get event details from API
* @function getEvent
* @param {Number} eventId - Unique event ID to fetch
* @param {Function} callback - Function to call once data returned
*/
var getEvent = function(eventId, callback){
    $.getJSON('/api/events/' + eventId + '?geoformat=' + GEOFORMAT, function ( data ){
    // Zoom to location

        if (data.result.features[0].properties.metadata.hasOwnProperty('bounds')) {
            zoomToEventBounds(data.result.features[0].properties.metadata.bounds);
        } else {
            zoomToEventPoint([data.result.features[0].geometry.coordinates[1],data.result.features[0].geometry.coordinates[0]]);
        }
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
* @function getReports
* @param {Number} eventId - UniqueId of event
* @param {Object} mapForReports - map to put the reports on
* @param {Object} callback - mapping callback function once reports are loaded
**/
var getReports = function(eventId, mapForReports, callback){
    $.getJSON('/api/reports/?eventId=' + eventId + '&geoformat=' + GEOFORMAT, function( data ){
        callback(data.result, mapForReports);
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
};

function openEventPopup(id)
{
    eventsLayer.eachLayer(function(layer){
        if (layer.feature.properties.id == id)
        {
            layer.openPopup(mainMap.center);
        }
    });
}

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
        if (icon_name.includes('epidemiological')) {
            icon_name = 'epidemic';
        }

        var popupContent = '<a href=\'/events/?eventId=' + feature.properties.id +
    '\'><img src=\'/resources/images/icons/event_types/'+icon_name+'.svg\' width=\'40\'></a>' +
    '<strong><a href=\'/events/?eventId=' + feature.properties.id +
    '\'>' + feature.properties.metadata.name +'</a></strong>' + '<BR>' +
    'Opened: ' + (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') + '<BR>' +
    'Last updated at: ' + (new Date(feature.properties.updated_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
    'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
    statusStr +
    severityStr +
    notificationStr +
    totalPopulationStr +
    affectedPopulationStr;

        $('#ongoingEventsContainer').append(
            '<div class="list-group-item cursorPointer" onclick="openEventPopup('+feature.properties.id+')">' +
      'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
      'Opened: ' + (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
      'Last updated at: ' + (new Date(feature.properties.updated_at)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
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
            if (feature.properties.id===currentEventId) {
                return L.marker(latlng, {icon: L.icon({
                    iconUrl: '/resources/images/icons/event_types/selected_event.svg',
                    iconSize:     [50, 50], // size of the icon
                    iconAnchor: [25, 50]
                    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
                    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
                })});

            } else {
                return L.marker(latlng, {icon: L.icon({
                    iconUrl: '/resources/images/icons/event_types/open_event.svg',
                    iconSize:     [50, 50], // size of the icon
                    iconAnchor: [25, 50]
                    //iconAnchor:   [13, -13], // point of the icon which will correspond to marker's location
                    //popupAnchor:  [13, 13] // point from which the popup should open relative to the iconAnchor
                })});
            }
        },
        onEachFeature: onEachFeature
    });

    if (Cookies.get('Ongoing MSF Responses')==='on') {
        eventsLayer.addTo(mainMap);
    }
    layerControl.addOverlay(eventsLayer, 'Ongoing MSF Responses');

};

// Load Contacts to contacts table tab
var loadContacts = function(err, contacts) {
    if (err) {
        alert('Error loading contacts: ' + err);
    } else {
        $('#contactsContainer').html(
            '<table class="table table-hover" id="contactsTable"><thead><tr><th>&nbsp;</th><th>Name</th><th>Email</th><th>Mobile</th><th>Affiliation</th><th>Speciality</th></tr></thead><tbody>'
        );

        $.each(contacts, function(key, value) {

            var speciality = '';
            if (typeof(value.properties.properties.type) !== 'undefined' && value.properties.properties.type.toUpperCase().includes('MSF')) {

                speciality = (typeof(value.properties.properties.speciality) === 'undefined'
                    ? ''
                    : value.properties.properties.speciality);

            }


            // console.log(key, value);
            $('#contactsTable').append(
                '<tr id=\'crow'+value.properties.id+'\' class=\'cursorPointer\' onclick=\'openContactPopup('+value.properties.id+')\'><td><a data-toggle=\'modal\' data-target=\'#contactDetailsModal\' href=\'#\' onclick=\'onContactLinkClick(' +
          value.properties.id +
          ')\' class=\'contact-link btn btn-sm btn-primary\' title=\'Quick View\'><i class=\'glyphicon glyphicon-eye-open\'></i></a></td><td>' +
          (typeof value.properties.properties.title === 'undefined'
              ? ''
              : value.properties.properties.title) +
          ' ' +
          value.properties.properties.name +
          '</td><td class="emailcell">' +
          (typeof value.properties.properties.email === 'undefined'
              ? ''
              : '<a href="mailto:' +
              value.properties.properties.email +
              '">' +
              value.properties.properties.email +
              '</a>') +
          '</td><td>' +
          (typeof value.properties.properties.cell === 'undefined'
              ? ''
              : value.properties.properties.cell) +
          '</td><td>' +
          (typeof value.properties.properties.type === 'undefined'
              ? ''
              : value.properties.properties.type) +
          '</td><td>' + speciality +

          '</td></tr>'
            );
        });

        $('#contactsTable').append('</tbody></table>');
    }
};

// Perform GET call to get contacts
var getContacts = function(term,type){
    var url='/api/contacts?geoformat=geojson' +(term ? ('&search='+term) :'');
    var lngmin= mainMap.getBounds().getSouthWest().wrap().lng;
    var latmin= mainMap.getBounds().getSouthWest().wrap().lat;
    var lngmax= mainMap.getBounds().getNorthEast().wrap().lng;
    var latmax= mainMap.getBounds().getNorthEast().wrap().lat;
    if (!term) {
        url=url+'&lngmin='+lngmin+'&latmin='+latmin+'&lngmax='+lngmax+'&latmax='+latmax;
    }
    if (type) {
        url=url+'&type='+type;
    }
    $.getJSON(url, function (data){
        loadContacts(null, data.result.features);
        //remap contacts
        mapContacts(data.result);
        contactsLayer.eachLayer(function(layer){
            layer.on('mouseover',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('mouseout',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
            layer.on('touchstart',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('touchend',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
        });

    }).fail(function(err){
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            // Catch condition where no data returned
            loadContacts(err.responseText, null);
        }
    });
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
              (new Date(feature.properties.created)).toLocaleString().replace(/:\d{2}$/,'')+
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

    if (points.length > 1){
        mapForReports.fitBounds(points, {padding: [200,200]});
    }

};

/**
* Function to add contacts to map
* @function mapContacts
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
      '<br>Private contact? ' + (feature.private ? 'yes' : 'no') +
      '<br>Email address: '+(typeof(feature.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a>') +
      '<br>Mobile: '+(typeof(feature.properties.properties.cell)==='undefined' ? '' : feature.properties.properties.cell) +
      '<br>Type of contact: '+(typeof(feature.properties.properties.type)==='undefined' ? '' : feature.properties.properties.type) +
      '<br>Speciality: '+(typeof(feature.properties.properties.speciality)==='undefined' ? '' : feature.properties.properties.speciality);
        }

        layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
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

            return new L.DivIcon({ html: '<div><span class="marker-cluster-msf-contacts-text"><b>' + childCount + '</b></span></div>', className: 'marker-cluster marker-cluster-msf-contacts' , iconSize: new L.Point(40, 40) });

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
* @function initGetContacts
* @param {function} callback - function to process contact data once loaded
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
* @function initGetMissions
* @param {function} callback - function to process mission data once loaded

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
* @function mapMissions
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
        if (Cookies.get('Previous MSF Responses')==='on') {
            missionsClusters.addTo(mainMap);
        }
        firstMissionsLoad = false;
    }


    layerControl.addOverlay(missionsClusters, 'Previous MSF Responses');

};

// Get eventId from URL
currentEventId = getQueryVariable('eventId');
// Only ask API where event is specified and not empty
if (currentEventId !== false && currentEventId != ''){
    getEvent(currentEventId, printEventProperties);
    getReports(currentEventId, mainMap, mapReports);
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

switch (Cookies.get('MapLayer')) { // add base map layer based on cookie setting
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
    Cookies.set('MapLayer',baselayer.name); // update default (set in cookie)
});

var groupedOverlays = {
    'Reports': {},
};

var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, groupOptions).addTo(mainMap);

if (L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(layerControl._container)
        .disableScrollPropagation(layerControl._container);
} else {
    L.DomEvent.disableClickPropagation(layerControl._container);
}

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

/**
* Function to get all events from the API
* @param {Function} callback - Function to call once data returned
* @returns {String} err - Error message if any, else none
* @returns {Object} events - Events as GeoJSON FeatureCollection
*/
var getEventsByCountry = function(country, callback){
    var q;
    if (typeof(country)!=='undefined' && country !== '') {
        q = '&country='+country;
    }
    $.getJSON('/api/events/?status=active'+q+'&geoformat=' + GEOFORMAT, function ( data ){
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

getFeeds('/api/hazards/pdc',mapPDCHazards);
getFeeds('/api/hazards/tsr',mapTSRHazards);
getFeeds('/api/hazards/usgs',mapUSGSHazards);
getFeeds('/api/hazards/gdacs',mapGDACSHazards);
getFeeds('/api/hazards/ptwc',mapPTWCHazards);



// Enter an API key from the Google API Console:
//   https://console.developers.google.com/apis/credentials
const GoogleApiKey = 'AIzaSyDRRHBlIoij_c4Lx8IzwY8OpPmVPABC81g';

// Set endpoints for Google
const GoogleEndpoints = {
    translate: '',
    detect: 'detect',
    languages: 'languages'
};

/**
* Abstract Google Translate API request function
* @function makeApiRequest
* @param {string} endpoint - specific Google translate endpoint (subpath) from GoogleEndpoints
* @param {Object} data - data to send to Google endpoint for translation / language detection / etc.
* @param {string} type - HTTP method
*/
function makeApiRequest(endpoint, data, type) {
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

/**
* Abstract API
* @function makeApiRequest
* @param {string} endpoint - specific Google translate endpoint (subpath) from GoogleEndpoints
* @param {Object} data - data to send to Google endpoint for translation / language detection / etc.
* @param {string} type - HTTP method
*/
function translate(data) {
    makeApiRequest(GoogleEndpoints.translate, data, 'GET', false).then(function(
        resp
    ) {
        if (!(resp.data.translations[0].translatedText === 'undefined' || resp.data.translations[0].translatedText == '')) {
            $('#searchTerm').val(resp.data.translations[0].translatedText);
            $('#btnSearchTwitter').trigger('click');
        } else {
            $('#searchTerm').val('(no translation found)');
        }
    });
}


var editCategory='general';

// vue functions used for filling in event display
var vmEventDetails = new Vue({

    data: {
        severityColors: severityColors,
        severityLongTexts: severityLongTexts,
        msfTypeOfProgrammes:msfTypeOfProgrammes,
    },
    mounted:function(){
        $('.msf-loader').hide();
        //console.log('mounted event instance.');
        //console.log(this.event);

        // Search Twitter
        $('#btnSearchTwitter').click(function() {
            if ($('#searchTerm').val() !== '') {
                var search = $('#searchTerm').val();
                getTweets(search);

            }
        });


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
                searchTerm = typeStr(currentEventProperties.type, currentEventProperties.metadata.sub_type);
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


        window.makeApiRequest = makeApiRequest;
        var translationObj = {};

        $('#translateLanguageSelection')
        // Bind translate function to translate button
            .on('change', function() {
                var translateObj = {
                    textToTranslate: $('#searchTerm').val(),
                    targetLang: $(this).val()
                };

                if (translateObj.textToTranslate !== '') {
                    translate(translateObj);
                }
            });

        $('#contSearchTerm').on('input',function(){
            if ($('#inputContactType').val()!=='') {
                thGetContacts(this.value,$('#inputContactType').val());
            } else {
                thGetContacts(this.value);
            }

        });

        $('#inputContactType').on('change',function(){
            if ($('#contSearchTerm').val()!=='') {
                thGetContacts($('#contSearchTerm').val(),this.value);
            } else {
                thGetContacts(null,this.value);
            }
        });

        eventReportLink = WEB_HOST + 'report/?eventId=' + this.event.id + '&reportkey=' + this.event.reportkey;


    },
    methods:{
        getTypeOfProgramme:function(val)
        {
            var filtered= msfTypeOfProgrammes.filter(function(e){
                return e.value==val;
            });
            return filtered[0].text;
        },
        formatDateOnly:function(value) {
            if (value) {
                return moment(value).format('YYYY-MM-DD');
            }
        },
        editEvent:function(category){
            editCategory=category;
            onEditEvent();
            $( '#editModal' ).modal('show');
        }
    },
    computed:{
        notStr:function(){
            return (this.event.metadata.notification.length > 0) ? this.event.metadata.notification[this.event.metadata.notification.length-1].notification+' @ ' + (new Date(this.event.metadata.notification[this.event.metadata.notification.length-1].notification_time*1000)).toLocaleTimeString().replace(/:\d{2}$/,'') : '(none)';
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
