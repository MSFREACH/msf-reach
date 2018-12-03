/*eslint no-unused-vars: off*/

/**
* Landing page script
* @file public/resources/js/landing.js
* Show overview of MSF Reach events
*/

// Constants
var GEOFORMAT='geojson'; // use geojson as preferred goepsatial data format

// mapping from short type names to longer names
var TYPES=[{'conflict':'Conflict'}, {'natural_disaster':'Natural Disaster'},
    {'disease_outbreak':'Disease Outbreak'}, {'search_and_rescue':'Search & rescue'},
    {'displacement':'Displacement'}, {'malnutrition':'Malnutrition'}, {'other':'Other (detail in summary)'}
];

var RSS_LAYER_NAMES = ['- PDC', '- GDACS', '- TSR', '- PTWC', '- USGS'];

// setup variables to store contact layers
var MSFContactsLayer, nonMSFContactsLayer;

// set up variable to store report ID for new event creation from unassigned report
var report_id_for_event = null; // null = not creating event from unassigned report

// cookie for last page load
Cookies.set('last_load',String(Date.now()/1000));

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

        // Get the number of possible values (-1)
        var vals = 3-1;

        // Space out values
        for (var i = 0; i <= vals; i++) {

            var el = $('<label>'+severityLabels[i]+'</label>').css('left',(i/vals*100)+'%');

            $( '#inputSeverityScale' ).append(el);

        }

    });


// set up the variable for holding the events layer
var eventsLayer;

var disease_subtypes = ['cholera', 'ebola','dengue','malaria','measles','meningococcal_meningitis','yellow_fever','other_disease_outbreak'];

var deleteEvent= function(event_id){
    if (confirm('Are you sure you want to permanently delete this event? \nWARNING: ALL linked reports will be deleted. This action cannot be undone.'))
    {
        $.ajax({
            type: 'DELETE',
            url: '/api/events/' + event_id,
            contentType: 'application/json'
        }).done(function(data, textStatus, req) {
            //console.log(data);
            getAllEvents(mapAllEvents);
            alert('Event successfully deleted.');



        }).fail(function(err) {
            alert('Error in deleting Event...');

            if (err.responseText.includes('expired')) {
                alert('session expired');
            }
        });

    }
};

var deleteContact= function(contact_id){

    if (confirm('Are you sure you want to permanently delete this contact? \nWARNING: This action cannot be undone.'))
    {
        $.ajax({
            type: 'DELETE',
            url: '/api/contacts/' + contact_id,
            contentType: 'application/json'
        }).done(function(data, textStatus, req) {
            //console.log(data);
            getContacts();
            alert('Contact successfully deleted.');
            $('#contactDetailsModal').modal('hide');



        }).fail(function(err) {
            alert('Error in deleting this contact. You may not be authorized to delete this contact.');

            if (err.responseText.includes('expired')) {
                alert('session expired');
            }
            $('#contactDetailsModal').modal('hide');
        });

    }
};


/**
* Function to map and print a table of events
* @function mapAllEvents
* @param {Object} err - error object, null if no error
* @param {Object} events - GeoJSON Object containing event details
*/
var mapAllEvents = function(err, events){

    $('#watchingEventProperties').html('');
    $('#ongoingEventProperties').html('');
    // Add popups
    function onEachFeature(feature, layer) {

        var dateOfEvent = new Date (feature.properties.metadata.event_datetime || feature.properties.created_at);
        if ( !(eventSearchFromDate && eventSearchToDate) ||
            (eventSearchFromDate && !eventSearchToDate && ((new Date(eventSearchFromDate)) < dateOfEvent)) ||
            (!eventSearchFromDate && eventSearchToDate && (dateOfEvent < (new Date(eventSearchToDate)))) ||
            (eventSearchFromDate && eventSearchToDate && ((new Date(eventSearchFromDate)) < dateOfEvent && dateOfEvent < (new Date(eventSearchToDate))))
        ) {
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
                notificationStr = 'Latest notification: ' + getLatestNotification(feature.properties.metadata.notification).notification + '<br>';
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
            type = type.toLowerCase().replace('disease_outbreak','epidemic').replace('disease_outbreak','').replace('natural_hazard','');

            var icon_names = type.split(',');
            var icon_html = icon_names.map(function (item) {
                if (!item.match(/other/) && item !== '' && disease_subtypes.indexOf(item) === -1) {
                    return '<img src="/resources/images/icons/event_types/' + item + '.svg" width="40">';
                } else return '';
            }).join('');

            var popupContent = '<a href=\'/events/?eventId=' + feature.properties.id +
        '\'>'+icon_html+'</a>' +
        '<strong><a href=\'/events/?eventId=' + feature.properties.id +
        '\'>' + feature.properties.metadata.name +'</a></strong>' + '<br>' +
        ((typeof(feature.properties.metadata.project_code)!=='undefined' && feature.properties.metadata.project_code) ? 'Project code: ' + feature.properties.metadata.project_code + '<br>' : '' ) +
        'Opened (local time of event): ' + ((feature.properties.metadata.event_datetime || feature.properties.created_at) ? (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') : '') + '<BR>' +
        'Last updated at (UTC): ' + feature.properties.updated_at.split('T')[0] + '<br>' +
        'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
        statusStr +
        severityStr +
        'Description: ' + feature.properties.metadata.description + '<br>' +
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
            if (!feature.properties.metadata.name || feature.properties.metadata.name === '') {
                feature.properties.metadata.name = '(no name specified)';
            }

            var location = '';
            if(!feature.properties.metadata.areas){
                location = feature.properties.metadata.country;
            }else{
                location = _.map(feature.properties.metadata.areas, function(el){
                    if(!_.isEmpty(el.region)){
                        return el.region +' '+ el.country_code;
                    }else{
                        return el.country;
                    }
                }).join(', ');
            }

            var hasLocation = feature.properties.metadata.hasOwnProperty('areas') || feature.properties.metadata.hasOwnProperty('country');
            $(eventDiv).append(
                '<div class="list-group-item">' +
                '<button type="button" class="btn btn-danger btn-sm show-if-write-permission" style="float:right;display:none;" onclick="deleteEvent('+feature.properties.id+')"><span class="glyphicon glyphicon-remove"></span></button>'+
            ((typeof(feature.properties.metadata.project_code)!=='undefined' && feature.properties.metadata.project_code) ? 'Project code: ' + feature.properties.metadata.project_code + '<br>' : '' ) +
        'Name: <a href="/events/?eventId=' + feature.properties.id + '">' + feature.properties.metadata.name + '</a><br>' +
        'Opened: ' + ((feature.properties.metadata.event_datetime || feature.properties.created_at) ? convertToLocaleDate(feature.properties.metadata.event_datetime || feature.properties.created_at) :'') + '<br>' +
        'Last updated at: ' + convertToLocaleDateTime(feature.properties.updated_at) + '<br>' +
        (hasLocation ? 'Area(s): ' + location + '<br>': '') +
        'Type(s): ' + typeStr(feature.properties.type, feature.properties.metadata.sub_type) + '<br>' +
        statusStr +
        notificationStr +
        totalPopulationStr +
        affectedPopulationStr +
        'Description: ' + feature.properties.metadata.description + '<br>' +
        '</div>'
            );

            if (feature.properties && feature.properties.popupContent) {
                popupContent += feature.properties.popupContent;
            }

            layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
        }
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
    operatorCheck();

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
        $('#contact_container').html(
            '<table class="table table-hover" id="contactsTable"><thead><tr><th>&nbsp;</th><th>Name</th><th>Private?</th><th>Type</th><th>Country</th></tr></thead><tbody>'
        );

        $.each(contacts, function(key, value) {

            var employer = '';
            if (value.properties.hasOwnProperty('employer')) {
                employer = value.properties.employer;
            }

            var country = '';
            if (value.properties.hasOwnProperty('address')) {
                country=value.properties.address.split(',').slice(-1)[0];
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
          '</td><td>'+(value.properties.private ? 'yes' : 'no') +

          '</td><td>' +
          (typeof value.properties.properties.type === 'undefined'
              ? ''
              : value.properties.properties.type) +

          '</td></td>'+ country+ '</td></tr>'
            );

        });

        $('#contactsTable').append('</tbody></table>');
    }
};

/**
* Function to get contacts
* @function getContacts
* @param {function} callback - callback to run once contacts are fetched
* @param {String} term - search term
* @param {String} type - contact type to filter by
**/
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
        if (type==='msf_associate') {
            url = url + '&msf_associate=true';
        } else if (type==='msf_peer') {
            url = url + '&msf_peer=true';
        } else {
            url=url+'&type='+type;
        }
    }
    $.getJSON(url, function (data){
        loadContacts(null, data.result.features);
        //remap contacts
        mapContacts(data.result);
        MSFContactsLayer.eachLayer(function(layer){
            layer.on('mouseover',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('mouseout',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
            layer.on('touchstart',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('touchend',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
        });
        nonMSFContactsLayer.eachLayer(function(layer){
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
         'Updated: ' + (new Date(feature.properties.updated)).toLocaleString().replace(/:\d{2}$/,'') + '<br>' +
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
* @function mapMissions - function to map Previous MSF Responses
* @param {Object} missions - GeoJson FeatureCollection containing mission points
**/
var mapMissions = function(missions ){

    function onEachFeature(feature, layer) {

        var popupContent = '';

        if (feature.properties && feature.properties.properties) {
            popupContent += '<a href="#" onclick="onMissionLinkClick(' +
        feature.properties.id +
        ')">' + missionPopupIcon(feature.properties.properties.type) + '</a>';
            popupContent += '<a href="#" onclick="onMissionLinkClick(' +
        feature.properties.id +
        ')">' + feature.properties.properties.name + '</a><br>';
            if (typeof(feature.properties.properties.notification) !== 'undefined' && feature.properties.properties.notification.length > 0) {
                popupContent += 'Latest notification: ' + getLatestNotification(feature.properties.properties.notification).notification + '<BR>';
            } else {
                popupContent += 'Latest notification: (none)<BR>';
            }
            popupContent += 'Description: ' + feature.properties.properties.description + '<br>';
            popupContent += 'Start date: ' + (convertToLocaleDate(feature.properties.properties.event_datetime)  || feature.properties.properties.startDate) + '<BR>';
            popupContent += 'Finish date: ' + (convertToLocaleDate(feature.properties.properties.event_datetime_closed) || feature.properties.properties.finishDate  ) + '<BR>';
            popupContent += 'Managing OC(s): ' + ((feature.properties.properties.hasOwnProperty('msf_response_operational_centers') && feature.properties.properties.msf_response_operational_centers.length > 0) ? feature.properties.properties.msf_response_operational_centers.toString() : feature.properties.properties.managingOC) + '<BR>';
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
        if (Cookies.get('Previous MSF Responses')==='on') {
            missionsClusters.addTo(mainMap);
        }
        firstMissionsLoad = false;
    }

    layerControl.addOverlay(missionsClusters, 'Previous MSF Responses');

};

function vidImageErrHandler(event)
{
    $(event.target).hide();
}

/**
* Function to add reports to map
* @param {Object} reports - GeoJson FeatureCollection containing report points
**/
var mapReports = function(reports,mapForReports){

    $('#reportsContainer').html(
        '<ul class="table table-hover" id="reportsTable">'
    );

    function onEachFeature(feature, layer) {

        var popupContent = '';
        var reportsTableContent = '';

        if (feature.properties && feature.properties.content) {
            popupContent += 'Decription: '+ feature.properties.content.description.substring(0,150) + '...<BR>';
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
                popupContent += '<img src="'+feature.properties.content.image_link+'" width="100%" onerror="vidImageErrHandler(event)">';
                popupContent += '<br/><video width="100%" controls onerror="vidImageErrHandler(event)" src="'+feature.properties.content.image_link+'" ></video>';
                popupContent += '<br/>Download multimedia content <a target="_blank" href="'+feature.properties.content.image_link+'">here</a> ';

            }


            $('#reportsTable').append(
                `<li id="reports-table-row-${feature.properties.id}">
                <span ><a href='#' onclick='openReportPopup(${
    feature.properties.id})' class='contact-link btn btn-sm btn-primary' title='Quick View'><i class='glyphicon glyphicon-eye-open'></i> Open</a></span>`+
              `<span><label> Type  </label>${feature.properties.content.report_tag}</span>`+
              `<span><label> Status  </label><select id="report-${feature.properties.id}">`+
                '<option value="unconfirmed">unconfirmed</option>' +
                '<option value="confirmed">confirmed</option>' +
                '<option value="ignored">ignored</option>' +
              '</select></span>' +
              `<span><label> Assign Event </label><select id="events-for-report-${feature.properties.id}"></select></span>`+
              `<div>Description ${feature.properties.content.description}</div></li>`

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
                    contentType: 'application/json',
                    success: function(data) {
                        /* refresh map
                      * - doesn't hurt for confirmed/unconfimed and
                      * calling this here will ensure ignored entries aren't put back on table
                      */
                        getReports(mainMap, mapReports);
                    }
                });

                if (selectedVal==='ignored') {

                    // remove row
                    $('#reports-table-row-'+$(this).attr('id').split('-')[1]).remove();

                }


            });



            if (!feature.properties.event_id) {
                $('#events-for-report-'+feature.properties.id).append('<option value="">Select...</option>');
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
                        report_id_for_event = $(this).attr('id').split('-').slice(-1)[0];

                        // get coordinates
                        var coordinates;

                        $.getJSON('api/reports/'+report_id_for_event, function(data) {
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
                            eventId: selectedVal
                        };

                        $.ajax({
                            type: 'POST',
                            url: '/api/reports/linktoevent/'+$(this).attr('id').split('-').slice(-1)[0],
                            data: JSON.stringify(body),
                            contentType: 'application/json',
                            success: function(data) {
                                $('#reports-table-row-'+report_id_for_event).remove();
                                getReports(mainMap, mapReports);
                            }
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

    if (accessLayer) {
        computerTriggered=true;
        mainMap.removeLayer(accessLayer);
        layerControl.removeLayer(accessLayer);
        computerTriggered=false;
    }
    if (needsLayer) {
        computerTriggered=true;
        mainMap.removeLayer(needsLayer);
        layerControl.removeLayer(needsLayer);
        computerTriggered=false;
    }
    if (contactsLayer) {
        computerTriggered=true;
        mainMap.removeLayer(contactsLayer);
        layerControl.removeLayer(contactsLayer);
        computerTriggered=false;
    }
    if (securityLayer) {
        computerTriggered=true;
        mainMap.removeLayer(securityLayer);
        layerControl.removeLayer(securityLayer);
        computerTriggered=false;
    }



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
      '<br>Private contact? ' + (feature.private ? 'yes' : 'no') +
      '<br>Email address: '+(typeof(feature.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a>') +
      '<br>Mobile: '+(typeof(feature.properties.properties.cell)==='undefined' ? '' : feature.properties.properties.cell) +
      '<br>Type of contact: '+(typeof(feature.properties.properties.type)==='undefined' ? '' : feature.properties.properties.type) +
      '<br>Organisation: '+(typeof(feature.properties.properties.employer)==='undefined' ? '' : feature.properties.properties.employer) +
      '<br>Job title: '+(typeof(feature.properties.properties.job_title)==='undefined' ? '' : feature.properties.properties.job_title);
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

// Create map
var mainMap = L.map('mainMap',{dragging: !L.Browser.mobile, tap:false, doubleClickZoom:false});

// To get healthsites loaded, need to first add load event and then setView separately

mainMap.on('load', function(loadEvent) {
    getContacts();
    getHealthSites(mainMap.getBounds(),mapHealthSites);
    $.getJSON({
        url: '/api/utils/arcgistoken',
        type: 'GET',
        error: function(err){
            alert(err);
        },
        success: function(data) {
            ARCGIS_TOKEN = data.token;
            getMSFPresence(mapMSFPresence);
        }
    });
});

mainMap.on('moveend', function(){getContacts($('#contSearchTerm').val());});

let bounds = Cookies.get('landingMapBounds');
var contactDownloadLink;
function checkAndDownloadContacts(){
    if ($('#cbContactsAgreed').is(':checked'))
        window.open(contactDownloadLink);
    else {
        alert('You must agree to MSF Hong Kong Privacy Policy before download. ');
    }
}


if (typeof(bounds)!=='undefined') {
    boundsArray = bounds.split(',');
    mainMap.fitBounds([[boundsArray[1],boundsArray[0]],[boundsArray[3],boundsArray[2]]]);
    var wrappedLatLng=getWarppedLatLng(mainMap.getBounds());
    contactDownloadLink='/api/contacts/csv/download?lngmin='+wrappedLatLng.lngmin+'&latmin='+wrappedLatLng.latmin+'&lngmax='+wrappedLatLng.lngmax+'&latmax='+wrappedLatLng.latmax;
} else {
    contactDownloadLink='/api/contacts/csv/download?lngmin=-180&latmin=-90&lngmax=180&latmax=90';
    mainMap.fitBounds([[-90,-180],[90,180]]);
}

mainMap.on('zoomend', function(zoomEvent)  {
    getHealthSites(mainMap.getBounds(),mapHealthSites);
});

mainMap.on('moveend', function(){
    Cookies.set('landingMapBounds',mainMap.getBounds().toBBoxString());
    var wrappedLatLng=getWarppedLatLng(mainMap.getBounds());
    contactDownloadLink='/api/contacts/csv/download?lngmin='+wrappedLatLng.lngmin+'&latmin='+wrappedLatLng.latmin+'&lngmax='+wrappedLatLng.lngmax+'&latmax='+wrappedLatLng.latmax;
    getMSFPresence(mapMSFPresence);
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

if (L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(layerControl._container)
        .disableScrollPropagation(layerControl._container);
} else {
    L.DomEvent.disableClickPropagation(layerControl._container);
}

addLegendsToAMaps(mainMap);

// get and map data:
getAllEvents(mapAllEvents);
getReports(mainMap, mapReports);
getFeeds('/api/hazards/pdc',mapPDCHazards);
getFeeds('/api/hazards/tsr',mapTSRHazards);
getFeeds('/api/hazards/usgs',mapUSGSHazards);
getFeeds('/api/hazards/gdacs',mapGDACSHazards);
getFeeds('/api/hazards/ptwc',mapPTWCHazards);
//getMissions(mapMissions);

if (window.location.hostname.toLowerCase().startsWith('test.') || window.location.hostname.toLowerCase().startsWith('dev.')) {
    getFeeds('/api/hazards/lra',mapLRAHazards);
    getDRCLayer('/api/layers/health%20facilities',mapDRCHealthSites);
    getDRCLayer('/api/layers/villages%20and%20cities',mapDRCVillages);
    getDRCLayer('/api/layers/MSF%20OCG%20locations',mapDRCPresence);
    getDRCLayer('/api/layers/bunia%20current%20track%201',mapBuniaLayer1);
    getDRCLayer('/api/layers/bunia%20current%20track%202',mapBuniaLayer2);
}


var TOTAL_FEEDS=0;
var totalFeedsSaved=0;
var allFeedFeatures=[];

var updateFeedsTable = function() {
    //  reset these each call:
    TOTAL_FEEDS=0;
    totalFeedsSaved=0;
    allFeedFeatures=[];
    $('#rssFeeds').html('');

    // update TOTAL_FEEDS first so that other calls to tableFeeds work properly
    if (Cookies.get('- PDC')==='on') {
        TOTAL_FEEDS++;
    }
    if (Cookies.get('- USGS')==='on') {
        TOTAL_FEEDS++;
    }
    if (Cookies.get('- TSR')==='on') {
        TOTAL_FEEDS++;
    }
    if (Cookies.get('- GDACS')==='on') {
        TOTAL_FEEDS++;
    }
    if (Cookies.get('- PTWC')==='on') {
        TOTAL_FEEDS++;
    }
    /*
    if (Cookies.get('- LRA Crisis')==='on') {
        TOTAL_FEEDS++;
    }
    */

    if (Cookies.get('- PDC')==='on') {
        getFeeds('/api/hazards/pdc', tableFeeds);
    }
    if (Cookies.get('- USGS')==='on') {
        getFeeds('/api/hazards/usgs', tableFeeds);
    }
    if (Cookies.get('- TSR')==='on') {
        getFeeds('/api/hazards/tsr', tableFeeds);
    }
    if (Cookies.get('- GDACS')==='on') {
        getFeeds('/api/hazards/gdacs', tableFeeds);
    }
    if (Cookies.get('- PTWC')==='on') {
        getFeeds('/api/hazards/ptwc', tableFeeds);
    }
    /*
    if (Cookies.get('- LRA Crisis')==='on') {
        getFeeds('/api/hazards/lra', tableFeeds);
    }
    */
};

updateFeedsTable();

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

var areaSelect = null;

mainMap.on('dblclick', function(dblclickEvent) {
    if (!areaSelect) {
        areaSelect = L.areaSelect({width:300, height:200});
        areaSelect.addTo(mainMap);
    } else {
        operatorCheck();
        $('#newEventModal').modal('show');
    }
});


$('#contSearchTerm').on('input',function(){
    if ($('#inputContactType').val()!=='') {
        getContacts(this.value,$('#inputContactType').val());
    } else {
        getContacts(this.value);
    }

});

$('#inputContactType').on('change',function(){
    if ($('#contSearchTerm').val()!=='') {
        getContacts($('#contSearchTerm').val(),this.value);
    } else {
        getContacts(null,this.value);
    }
});

mainMap.on('overlayadd', function (layersControlEvent) {
    if (!computerTriggered) {
        Cookies.set(layersControlEvent.name,'on');
        if (RSS_LAYER_NAMES.indexOf(layersControlEvent.name) > -1) {
            //console.log('updating feeds table');
            updateFeedsTable();
        }
    }
});


mainMap.on('overlayremove', function (layersControlEvent) {
    if (!computerTriggered) {
        Cookies.set(layersControlEvent.name,'off');
        if (RSS_LAYER_NAMES.indexOf(layersControlEvent.name) > -1) {
            //console.log('updating feeds table');
            updateFeedsTable();
        }
    }
});

if (location.hash.includes('#contact')) {
    onContactLinkClick(/\d+/.exec(location.hash)[0]);
    $('#contactDetailsModal').modal();
}

$(function(){

    $('#cbContactsAgreed').on('change',function(){
        $('#contactDownloadLink').attr('disabled',!($('#cbContactsAgreed').is(':checked')));
    });

    var bookmarkVue=new Vue({
        el:'#bookmarksList',
        data:{
            markdownSource:'',
            inEditMode:false,
            hasError:false
        },
        computed:{
            compiledMarkdown:function(){
                return marked(this.markdownSource, {sanitize: true});
            }
        },
        methods: {
            openHelpModal:function(){
                $('#bookmarksModal').modal('hide');
                $('#markdownModal').modal('show');
            },
            saveBookmarkEdits:function(){
                var vm=this;
                vm.hasError=false;
                $.ajax({
                    type: 'POST',
                    url: '/api/bookmarks',
                    data: JSON.stringify({
                        markdown: vm.markdownSource
                    }),
                    contentType: 'application/json'
                }).then(function(data){
                    //console.log(data);
                    vm.hasError=false;
                    vm.inEditMode=false;
                }).fail(function(err){
                    vm.hasError=true;
                    //console.log(err);

                });




            },
            loadBookmarks: function(){
                var vm=this;
                vm.inEditMode=false;
                vm.hasError=false;
                $.ajax({
                    url : '/api/bookmarks',
                    data: {},
                    type : 'GET',
                    dataType : 'json',
                    cache : false,
                }).then(function(data) {
                    vm.markdownSource=data.result.markdown;

                }).fail(function(err){
                    //console.log(err);
                });
            }

        },
        mounted:function(){

        }
    });

    $('#markdownModal').load('/common/markdown-modal.html');
    $('#markdownModal').on('hidden.bs.modal',function(){
        $('#bookmarksModal').modal('show');
    });
    $('#btnBookmarksModal').on('click',function(){
        $('#bookmarksModal').modal('show');
        bookmarkVue.loadBookmarks();

    });

});
