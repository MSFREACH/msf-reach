/*eslint no-unused-vars: off*/

/**
* Events page script
* @file public/resources/js/events.js
* Display and interact with event objects from events page
*/

var vmEventDetails;

var WEB_HOST = location.protocol+'//'+location.host+'/';
var EVENT_PROPERTIES = ['id', 'status', 'type', 'created'];

// cookie for last page load
Cookies.set('last_load',String(Date.now()/1000));


var clipboard = new Clipboard('.st-btn');

clipboard.on('success', function(e) {
    alert('link copied to your clipboard, ready to share');
});

// set up the map:
var mainMap = L.map('map',{dragging: !L.Browser.mobile, tap:false});

mainMap.on('load', function(loadEvent) {
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
    mainMap.setView(latlng, 4);
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
    'deployment': 'Deployment details',
    'incharge_name': 'In charge name',
    'incharge_position': 'In charge position',
    'exploratory_details': 'Exploratory details'
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
    var newEvent= $.extend(true,{},defaultEvent);

    if((!currentEventProperties.metadata.areas)||(currentEventProperties.metadata.areas.length==0))
    {
        var mockArea = {country: currentEventProperties.metadata.country, region: ''};
        currentEventProperties.metadata.areas = [mockArea];
    }

    if ((!currentEventProperties.metadata.severity_measures)||(currentEventProperties.metadata.severity_measures.length==0))
    {
        var mockSeverity = {scale: currentEventProperties.metadata.severity_scale, description: currentEventProperties.metadata.description};
        currentEventProperties.metadata.severity_measures = [mockSeverity];
    }

    var filedSeverities = currentEventProperties.metadata.severity_measures.length;
    var filedAreas = currentEventProperties.metadata.areas.length;
    if(filedSeverities < filedAreas) {
        // in the case that only one severity was set, we need to prepopulate severity obj to num of areas
        for(var s = filedSeverities; s < filedAreas; s++ ){
            currentEventProperties.metadata.severity_measures[s] = {scale: null, description: ''};
        }
    }

    vmObject.data.event= $.extend(true, newEvent, currentEventProperties);

    // set up country details tabs
    let countryDetailsCIAContainerContent = '';
    let countryDetailsLinksContainerContent = '';
    countryDetailsCIAContainerContent+='<ul class="nav nav-tabs">';
    countryDetailsLinksContainerContent+='<ul class="nav nav-tabs">';

    let countries = [];

    let countriesFilter = function(item) {
        if (countries.indexOf(item.country) < 0) {
            countries.push(item.country);
            return true;
        } else {
            return false;
        }
    };

    let newAreas = currentEventProperties.metadata.areas.filter(countriesFilter);

    for (var areaidx = 0; areaidx < newAreas.length; areaidx++) {
        if (newAreas[areaidx].country)
        {  countryDetailsCIAContainerContent+='<li role="presentation"><a id="countryDetailsCIATab'+newAreas[areaidx].country.replace(' ','_')+'" data-toggle="tab" '+(areaidx===0 ? 'class="active"' : '' ) + ' href="#countryCIA'+newAreas[areaidx].country.replace(' ','_')+'">'+newAreas[areaidx].country+'</a></li>';
            countryDetailsLinksContainerContent+='<li role="presentation"><a id="countryDetailsLinksTab'+newAreas[areaidx].country.replace(' ','_')+'" data-toggle="tab" '+(areaidx===0 ? 'class="active"' : '' ) + ' href="#countryLinks'+newAreas[areaidx].country.replace(' ','_')+'">'+newAreas[areaidx].country+'</a></li>';
        }
    }

    countryDetailsCIAContainerContent+='</ul>';
    countryDetailsLinksContainerContent+='</ul>';

    countryDetailsCIAContainerContent+='<div class="tab-content" style="height:70vh; width:100%;">';
    countryDetailsLinksContainerContent+='<div class="tab-content" style="height:70vh; width:100%;">';


    let numCountries = newAreas.length;
    let countryLinksCounter = 0;

    for (areaidx = 0; areaidx < newAreas.length; areaidx++) {
        if (newAreas[areaidx].country)
        {
            countryDetailsCIAContainerContent+='<div style="height:70vh; width:100%;" class="tab-pane fade'+(areaidx===0 ? ' in active' : '' ) + '" id="countryCIA'+newAreas[areaidx].country.replace(' ','_')+'">';
            countryDetailsLinksContainerContent+='<div style="height:70vh; width:100%;" class="tab-pane fade'+(areaidx===0 ? ' in active' : '' ) + '" id="countryCIA'+newAreas[areaidx].country.replace(' ','_')+'">';
            if (newAreas[areaidx].country_code) {
                countryDetailsCIAContainerContent+='<iframe style="height:70vh; width:100%;" src="https://www.cia.gov/library/publications/the-world-factbook/geos/'+findCountry({'a2': newAreas[areaidx].country_code}).gec.toLowerCase()+'.html"></iframe>';

                $.ajax({
                    type: 'GET',
                    url: '/api/utils/country_links?country=' + newAreas[areaidx].country_code.toUpperCase(),
                    contentType: 'application/json'
                }).done(function( data, textStatus, req ){

                    countryDetailsLinksContainerContent += '<ul>';
                    for (let oc in data.links) {
                        if (data.links.hasOwnProperty(oc)) {
                            countryDetailsLinksContainerContent+='<li><a href="'+data.links[oc]+'">'+oc+'</a></li>';
                        }
                    }
                    countryDetailsLinksContainerContent += '</ul>';
                    countryDetailsLinksContainerContent+='</div>';
                    countryLinksCounter++;
                    if (countryLinksCounter===numCountries) {
                        countryDetailsLinksContainerContent+='</div>';
                        $('#countryDetailsLinksContainer').append(countryDetailsLinksContainerContent);
                    }

                }).fail(function(err) {
                    if (err.responseText.includes('expired')) {
                        alert('session expired');
                    } else {
                        alert('error: '+ err.responseText);
                    }
                });


            } else if (findCountry({'name': newAreas[areaidx].country}) && findCountry({'name': newAreas[areaidx].country}).gec) {
                countryDetailsCIAContainerContent+='<iframe style="height:70vh; width:100%;" src="https://www.cia.gov/library/publications/the-world-factbook/geos/'+findCountry({'name': newAreas[areaidx].country}).gec.toLowerCase()+'.html"></iframe>';

                let a2 =findCountry({'name': newAreas[areaidx].country}).a2.toUpperCase();

                $.ajax({
                    type: 'GET',
                    url: '/api/utils/country_links?country=' + a2,
                    contentType: 'application/json'
                }).done(function( data, textStatus, req ){

                    countryDetailsLinksContainerContent += '<ul>';
                    for (let oc in data.links) {
                        if (data.links.hasOwnProperty(oc)) {
                            countryDetailsLinksContainerContent+='<li><a href="'+data.links[oc]+'">'+oc+'</a></li>';
                        }
                    }
                    countryDetailsLinksContainerContent += '</ul>';
                    countryDetailsLinksContainerContent+='</div>';
                    countryLinksCounter++;
                    if (countryLinksCounter===numCountries) {
                        countryDetailsLinksContainerContent+='</div>';
                        $('#countryDetailsLinksContainer').append(countryDetailsLinksContainerContent);
                    }

                }).fail(function(err) {
                    if (err.responseText.includes('expired')) {
                        alert('session expired');
                    } else {
                        alert('error: '+ err.responseText);
                    }
                });


            }
        }//if
    }//for

    countryDetailsCIAContainerContent+='</div>';
    $('#countryDetailsCIAContainer').append(countryDetailsCIAContainerContent);


    vmEventDetails=new Vue(vmObject);
    $.getScript('//platform-api.sharethis.com/js/sharethis.js#property=5b0343fb6d6a0b001193c2b7&product=inline-share-buttons').done( function(){
        vmEventDetails.$mount('#eventVApp');

        setTimeout(function() {
            $('#st-1').append(
                '<span class="st-btn st-last btn-primary" data-clipboard-text="'+window.location+'"  data-network="sharethis"> '+
              '<svg fill="#fff" preserveAspectRatio="xMidYMid meet" height=".8em" width="1em" viewBox="0 0 40 40"><g><path d="m30 26.8c2.7 0 4.8 2.2 4.8 4.8s-2.1 5-4.8 5-4.8-2.3-4.8-5c0-0.3 0-0.7 0-1.1l-11.8-6.8c-0.9 0.8-2.1 1.3-3.4 1.3-2.7 0-5-2.3-5-5s2.3-5 5-5c1.3 0 2.5 0.5 3.4 1.3l11.8-6.8c-0.1-0.4-0.2-0.8-0.2-1.1 0-2.8 2.3-5 5-5s5 2.2 5 5-2.3 5-5 5c-1.3 0-2.5-0.6-3.4-1.4l-11.8 6.8c0.1 0.4 0.2 0.8 0.2 1.2s-0.1 0.8-0.2 1.2l11.9 6.8c0.9-0.7 2.1-1.2 3.3-1.2z"></path></g></svg>'+
              '</span>'
            );
            $('#st-2').append(
                '<span class="st-btn st-last btn-primary" data-network="sharethis" data-clipboard-text="'+vmEventDetails.eventReportLink+'">'+
              '<svg fill="#fff" preserveAspectRatio="xMidYMid meet" height="1em" width="1em" viewBox="0 0 40 40"><g><path d="m30 26.8c2.7 0 4.8 2.2 4.8 4.8s-2.1 5-4.8 5-4.8-2.3-4.8-5c0-0.3 0-0.7 0-1.1l-11.8-6.8c-0.9 0.8-2.1 1.3-3.4 1.3-2.7 0-5-2.3-5-5s2.3-5 5-5c1.3 0 2.5 0.5 3.4 1.3l11.8-6.8c-0.1-0.4-0.2-0.8-0.2-1.1 0-2.8 2.3-5 5-5s5 2.2 5 5-2.3 5-5 5c-1.3 0-2.5-0.6-3.4-1.4l-11.8 6.8c0.1 0.4 0.2 0.8 0.2 1.2s-0.1 0.8-0.2 1.2l11.9 6.8c0.9-0.7 2.1-1.2 3.3-1.2z"></path></g></svg>'+
              '</span>'
            );

        },1000);
    });


    eventReportLink= WEB_HOST + 'report/?eventId=' + eventProperties.id + '&reportkey=' + eventProperties.reportkey + '#' + eventProperties.metadata.name;


    //  $.getScript('//platform-api.sharethis.com/js/sharethis.js#property=5b0343fb6d6a0b001193c2b7&product=custom-share-buttons').done( function(s) {




    //});

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
            $('#inputNotification').val(getLatestNotification(eventProperties.metadata.notification).notification);
        }


        //    $("#eventSummary").append(eventProperties.metadata.summary);
        //    $("#eventPracticalDetails").append(eventProperties.metadata.practical_details);
        // $('#eventSecurityDetails').append(eventProperties.metadata.security_details);


        // var extra_metadata = unpackMetadata(eventProperties.metadata);
        // $('#eventExtra').append(extra_metadata);
        // if(extra_metadata){
        //     $('#collapseExtraDetails').addClass('in');
        // }

    }
    if (currentEventProperties) {
        if (currentEventProperties.metadata.saved_tweets && currentEventProperties.metadata.saved_tweets.length > 0) {
            $.each(currentEventProperties.metadata.saved_tweets, function(key, value){
                $('#savedTweets').prepend('<div id="'+value.tweetId+'" draggable="true" ondragend="dragOut(event)">'+value.html+'</div>');
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
var getReports = function(eventId, mapForReports, callback, callback2){
    $.getJSON('/api/reports/?eventId=' + eventId + '&geoformat=' + GEOFORMAT, function( data ){
        callback(data.result, mapForReports, callback2);
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
        var icon_name = type.includes(',') ? type.split(',')[0] : type;
        if (icon_name.includes('disease_outbreak')) {
            icon_name = 'epidemic';
        }

        var popupContent = '<a href=\'/events/?eventId=' + feature.properties.id +
    '\'><img src=\'/resources/images/icons/event_types/'+icon_name+'.svg\' width=\'40\'></a>' +
    '<strong><a href=\'/events/?eventId=' + feature.properties.id +
    '\'>' + feature.properties.metadata.name +'</a></strong>' + '<BR>' +
    'Opened: ' + ((feature.properties.metadata.event_datetime || feature.properties.created_at) ? (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') : '') + '<BR>' +
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
      'Opened: ' + ((feature.properties.metadata.event_datetime || feature.properties.created_at) ? (new Date(feature.properties.metadata.event_datetime || feature.properties.created_at)).toLocaleString().replace(/:\d{2}$/,'') : '') + '<BR>' +
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

let reportIds = [];
var points = []; // local storage for coordinates of reports (used for map bounds)

/**
* Function to add reports to map
* @param {Object} reports - GeoJson FeatureCollection containing report points
**/
var mapReports = function(reports,mapForReports){

    points = [];

    $('#reportsContainer').html(
        '<table class="table table-hover" id="reportsTable"><thead><tr><th>Open</th><th>Share</th><th>Type</th><th>Description</th><th>Reporter</th><th>Reported time</th><th>Status</th></thead><tbody>'
    );

    function onEachFeature(feature, layer) {

        var popupContent = '';
        var reportsTableContent = '';

        if (feature.properties && feature.properties.content) {
            popupContent += '<i id="popupReportShare'+feature.properties.id+'" class="icon-link-ext icon-floating" style="font-size:12px;"></i>';
            popupContent += 'Decription: '+ feature.properties.content.description.substring(0, 150)+ ' ...  <BR>';
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
                '<tr id="reports-table-row-'+feature.properties.id+'"><td><a href=\'#\' onclick=\'openReportPopup(' +
              feature.properties.id +
              ')\' class=\'contact-link btn btn-sm btn-primary\' title=\'Quick View\'><i class=\'glyphicon glyphicon-eye-open\'></i></a></td><td>' +
              '<i id="tableReportShare'+feature.properties.id+'" class="icon-link-ext icon-floating" style="font-size:18px;"></i></td><td>' +
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
                '<option value="ignored">ignored</option>' +
              '</select></td></tr>'

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

                if (selectedVal==='ignored') {
                    $('#reports-table-row-'+$(this).attr('id').split('-')[1]).remove();

                }
            });

        }

        $('#tableReportShare'+feature.properties.id).attr('data-clipboard-text',window.location.protocol+'//'+window.location.host+'/events/?eventId='+currentEventId+'#report'+feature.properties.id);

        let clipboard=new ClipboardJS(document.getElementById('tableReportShare'+feature.properties.id));
        clipboard.on('success', function(e) {
            alert('Link to report copied to clipboard');
        });

        $('#reportsTable').append('</tbody></table>');

        layer.bindPopup(popupContent, {  maxWidth: 'auto' }).on('popupopen', function () {
            $('#popupReportShare'+feature.properties.id).attr('data-clipboard-text',window.location.protocol+'//'+window.location.host+'/events/?eventId='+currentEventId+'#report'+feature.properties.id);
            let clipboard=new ClipboardJS(document.getElementById('popupReportShare'+feature.properties.id));
            clipboard.on('success', function(e) {
                alert('Link to report copied to clipboard');
            });
        });

        reportIds.push(feature.properties.id);

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
            return (feature.properties.content.report_tag === 'ACCESS' && feature.properties.status != 'ignored');
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
    if (location.hash.includes('#report')) {
        openReportPopup(/\d+/.exec(location.hash)[0]);
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
      '<br>Organisation: '+(typeof(feature.properties.properties.employer)==='undefined' ? '' : feature.properties.properties.employer) +
      '<br>Job title: '+(typeof(feature.properties.properties.job_title)==='undefined' ? '' : feature.properties.properties.job_title);
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
                popupContent += 'Latest notification: ' + getLatestNotification(feature.properties.properties.notification).notification + '<BR>';
            } else {
                popupContent += 'Latest notification: (none)<BR>';
            }
            popupContent += 'Description: ' + feature.properties.properties.description + '<br>';
            popupContent += 'Start date: ' + (convertToLocaleDate(feature.properties.properties.event_datetime)  || feature.properties.properties.startDate) + '<BR>';
            popupContent += 'Finish date: ' + (convertToLocaleDate(feature.properties.properties.event_datetime_closed) || feature.properties.properties.finishDate)+ '<BR>';
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
    Cookies.set('MapLayer',baselayer.name); // update default (set in cookie)
});

mainMap.on('moveend', function(){getMSFPresence(mapMSFPresence);});

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
        'metadata': currentEventProperties.metadata
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
        currentEventProperties.metadata.notification.push({'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val(), 'username': (localStorage.getItem('username')?localStorage.getItem('username') : 'localuser')});
    } else {
        currentEventProperties.metadata.notification = [{'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val(), 'username': (localStorage.getItem('username')?localStorage.getItem('username') : 'localuser')}];
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

    this.updateEvent(currentEventId, body);
});

var onEditEvent = function() {
    $( '#eventModalContent' ).load( '/events/edit.html' );
};

var onArchiveEvent = function() {
    $( '#archiveEventModalContent' ).load( '/events/archive.html' );
    $('#archiveModal').modal('show');
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

if (window.location.hostname.toLowerCase().startsWith('test.') || window.location.hostname.toLowerCase().startsWith('dev.')) {
    getFeeds('/api/hazards/lra',mapLRAHazards);
    getDRCLayer('/api/layers/health%20facilities',mapDRCHealthSites);
    getDRCLayer('/api/layers/villages%20and%20cities',mapDRCVillages);
    getDRCLayer('/api/layers/MSF%20OCG%20locations',mapDRCPresence);
    getDRCLayer('/api/layers/bunia%20current%20track%201',mapBuniaLayer1);
    getDRCLayer('/api/layers/bunia%20current%20track%202',mapBuniaLayer2);
}

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

Vue.component('date-picker', VueBootstrapDatetimePicker.default);

var eventMap;
var msfResponseMap;
var eventMapLayerControl;
var msfResponseMapLayerControl;

// var zoomToBounds = function(bounds, givenMap) {
//     var rBounds = L.latLngBounds(L.latLng(bounds._southWest.lat,bounds._southWest.lng),L.latLng(bounds._northEast.lat,bounds._northEast.lng));
//     givenMap.fitBounds(rBounds);
//     // eventMap.fitBounds(rBounds);
//     // msfResponseMap.fitBounds(rBounds);
// };



// vue functions used for filling in event display

Vue.component('date-picker', VueBootstrapDatetimePicker.default);

Vue.component('country-select', {
    props: ['options', 'value'],
    template: '<input  type="text" class="form-control input-sm" >',
    mounted: function () {
        var vmc = this;
        $(this.$el)
            .countrySelect(this.options)
            .countrySelect('selectCountry', this.value.iso2)
            .trigger('change')
        // emit event on change.
            .on('change', function () {
                var country = $(this).countrySelect('getSelectedCountryData');
                vmc.$emit('input', country);
            });
    },
    watch: {
        value: function (value) {
            // update value
            $(this.$el).countrySelect('selectCountry', value.iso2);
        },
        options: function (options) {
            $(this.$el).countrySelect(options);
        }
    },
    destroyed: function () {
        $(this.$el).off().countrySelect('destroy');
    }
});

Vue.filter('formatDateOnly', function(value,storedFormat) {
    if (value) {
        var d=moment(value);
        return (d.isValid() ? d.format(DATE_DISPLAY_FORMAT) : (value + ' (invalid date format)'));
    }
    else{
        return '';
    }
});

Vue.filter('formatFullDate', function(value,storedFormat) {
    if (value) {
    //return (new Date(value)).toLocaleString().replace(/:\d{2}$/,'');
        var d= (storedFormat ? moment(value,storedFormat) : moment(value) );
        return (d.isValid() ? d.format(DATETIME_DISPLAY_FORMAT) : (value + ' (invalid date format)'));
    } else {
        return '';
    }
});

Vue.filter('formatedNumber', function(value) {
    return value.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});

Vue.filter('relaceUnderscore', function(value) {
    return replaceUnderscore(value);
});

var replaceUnderscore = function(value) {
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    value = capitalizeFirstLetter(value);
    value = value.replace(/__/g, '-');
    return value.replace(/_/g, ' ');
};


Vue.component('vue-multiselect', window.VueMultiselect.default);

var vmObject = {

    data: {
        areas: {},
        severityColors: severityColors,
        severityLongTexts: severityLongTexts,
        msfTypeOfProgrammes:msfTypeOfProgrammes,
        keyMSFFigures: keyMSFFigures,
        msfResourceCategories: msfResourceCategories,
        countryParams:countryParams,
        msfOperationalCenters: msfOperationalCenters,
        msfMedicalMaterials:msfMedicalMaterials,
        msfNonMedicalMaterials:msfNonMedicalMaterials,
        newNotification:'',
        manualEmailHref:'mailto:admin@msf-reach.org',
        inviteeOptions: [
        ],
        selectedInvitees: [],
        msLoading: false,
        panelEditing:{
            'General': false,
            'Notification': false,
            'Response': false,
            'ExtCapacity': false,
            'Figures': false,
            'Resources': false,
            'Reflection': false,
            'Security': false,
            'ExtraDetails': false
        },
        panelDirty:{
            'General': false,
            'Notification': false,
            'Response': false,
            'ExtCapacity': false,
            'Figures': false,
            'Resources': false,
            'Reflection': false,
            'Security': false,
            'ExtraDetails': false
        },
        editingObj: {
            'General': {},
            'Notification': {},
            'Response': {},
            'ExtCapacity': {},
            'Figures': {},
            'Resources': {},
            'Security': {},
            'ExtraDetails': {}
        },
        invalid: {
            typesSelection: false,
            emptyStrings: false,
            nullAreas: false
        },
        fieldsInvalid: false,
        somePanelDirty:false,
        //NOTE: these variables are need for inline-editing of general information
        statuses: statuses,
        eventTypes: eventTypes,
        checkedTypes: [],
        checkedSubTypes: [],
        otherFields: {
            type: {
                isSelected: false,
                description: ''
            },
            disease_outbreak: {
                isSelected: false,
                description: ''
            },
            natural_disaster: {
                isSelected: false,
                description: ''
            }
        },
        searchTerm: '',
        extraDetailsLabel: labels,
        oldEventStatus: '',
        isAnalyzing:false,
        hasBeenAnalyzed: false,
        analyzedTimeTxt:'',
        vizalyticsResp: {},
        mapStatusToPanels: {
            'monitoring':['Notification', 'ExtCapacity', 'Figures', 'Reflection'],
            'exploration':['Notification', 'Figures', 'Resources', 'Reflection'],
            'ongoing':['Notification', 'Response', 'Figures', 'Resources'],
            'complete':[],
        },
        suggestEdit: {
            'Notification': false,
            'ExtCapacity': false,
            'Figures': false,
            'Resources': false,
            'Response': false,
            'Reflection': false
        },
        dateTimeConfig: {
            format: DATETIME_DISPLAY_FORMAT
        },
        subscInvitee:''
    },
    mounted:function(){
        $('#markdownModal').load('/common/markdown-modal.html');
        $('#eventMSFLoader').hide();
        var vm=this;

        let subject = `${vm.event.metadata.name} - updates on REACH`;

        let body=`
Hi all,

This is to kindly inform you that there has been updates on the ${vm.event.metadata.name} event to be shared with you. Please read them below:
- ...
- ...

For more detailed updates, please find them here ${window.location.href}.

If you have any questions, please do not hesitate to contact me at any time.

Best,
${localStorage.getItem('username')}
`;
        // update mail button
        if (vm.event.subscribers) {
            vm.manualEmailHref='mailto:'+Cookies.get('email')+'?bcc='+vm.event.subscribers.join(',')+'&subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
        }
        // Search Twitter
        $('#btnSearchTwitter').click(function() {
            if ($('#searchTerm').val() !== '') {
                var search = $('#searchTerm').val();
                vm.searchTerm = search;
                getTweets(search);
            }
        });

        $('.tags .remove').hover(function(){
            $(this).parent().addClass('close-box');
        });
        $('.tags .remove').mouseout(function(){
            $(this).parent().removeClass('close-box');
        });

        this.event.metadata.areas = currentEventProperties.metadata.areas;  // to watch when areas change for severity UI

        $( '.inputSeveritySlider' ).slider({
            min: 1, max: 3, step: 1
        }).each(function() {

            // Get the number of possible values (-1)
            var vals = 3-1;
            // Space out values
            for (var i = 0; i <= vals; i++) {
                var el = $('<label>'+severityLabels[i]+'</label>').css('left',(i/vals*100)+'%');
                $(this).append(el);
            }
            var index = $( '.inputSeveritySlider' ).index($(this));
            var scale = currentEventProperties.metadata.severity_measures[index].scale;
            $(this).slider('value', scale);
        });
        if(currentEventProperties.metadata.msf_response){
            $('#collapseResponse').addClass('in');
        }
        this.openDirtyPanel('ext_', '#collapseExtCapacity');
        this.openDirtyPanel('population', '#collapseFigures');
        this.openDirtyPanel('msf_resource', '#collapseResources');
        this.openDirtyPanel('msf_ref', '#collapseReflection');
        this.openDirtyPanel('security', '#collapseSecurity');

        var searchTerm = '';
        if (currentEventProperties) {
            searchTerm = '('+
                typeStr(currentEventProperties.type, currentEventProperties.metadata.sub_type)
                    .replace(/\s+/,') OR (')+')';
            searchTerm = searchTerm + ' AND (';
            if (currentEventProperties.metadata.hasOwnProperty('areas')) {
                for (var areai = 0; areai < currentEventProperties.metadata.areas.length; areai++) {
                    if (currentEventProperties.metadata.areas[areai].region) {
                        searchTerm += '(('+currentEventProperties.metadata.areas[areai].region + 
                            ' OR ' + currentEventProperties.metadata.areas[areai].country + ') ';
                    } else {
                        searchTerm += '(' + currentEventProperties.metadata.areas[areai].country +') ';
                    }
                    if (areai < currentEventProperties.metadata.areas.length - 1) {
                        searchTerm += ' OR ';
                    }
                }
            } else {
                if (currentEventProperties.metadata.hasOwnProperty('country')) {
                    searchTerm += currentEventProperties.metadata.country;
                }
            }
            searchTerm += ') ';
            let searchSinceDate ='';
            if (currentEventProperties.metadata.event_datetime) {
                searchSinceDate = 'since:'+currentEventProperties.metadata.event_datetime.match(/\d\d\d\d-\d\d-\d\d/);
            } else {
                searchSinceDate = 'since:'+currentEventProperties.created_at.match(/\d\d\d\d-\d\d-\d\d/);
            }
            searchTerm += searchSinceDate;
            $('#searchTerm').val(searchTerm);
            this.searchTerm = searchTerm;

            if (currentEventProperties.type) {
                var currentTypes = currentEventProperties.type.split(',');
                for(var t = 0; t < currentTypes.length; t++){
                    this.checkedTypes.push(currentTypes[t]);
                }
            }

            if (currentEventProperties.metadata.sub_type) {
                var currentSubTypes = currentEventProperties.metadata.sub_type.split(',');
                for(var st = 0; st < currentSubTypes.length; st++){
                    this.checkedSubTypes.push(currentSubTypes[st]);
                }
            }
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
    created:function(){
        //copy-paste from edit.html vue mounted.
        if (_.isEmpty(this.event.metadata.msf_response_operational_centers)) {
            var optCenter = this.event.metadata.operational_center;
            this.event.metadata.msf_response_operational_centers.push(optCenter);
        }

        if (_.isEmpty(this.event.metadata.ext_other_organizations)) {
            this.event.metadata.ext_other_organizations.push({
                name: this.event.metadata.other_orgs,
                deployment: this.event.metadata.deployment,
                arrival_date: null
            });
        }
    },
    methods:{
        typeStr:typeStr,
        queryContacts:function(term){
            var vm=this;
            if (term.length>=3)
            {
                vm.msLoading=true;
                $.ajax({
                    url: '/api/contacts/usersearch/'+term,
                    success: function( data ) {
                        vm.msLoading=false;
                        //console.log(data);
                        vm.inviteeOptions=JSON.parse(data.body).value; //JSON.parse(data.body).value
                    }
                });
            }
        },
        openDirtyPanel:function(str, domElement){
            var panelDirty = false;
            var filteredKeys = Object.keys(currentEventProperties.metadata).filter(function(k) {
                return  k.indexOf(str) == 0;
            });
            for(var fk = 0; fk < filteredKeys.length; fk++){
                var value = currentEventProperties.metadata[filteredKeys[fk]];
                if(typeof(value)!=='undefined' && (typeof(value) == 'string' || Array.isArray(value)) && value.length > 0){
                    panelDirty = true;
                }
            }
            if(panelDirty){
                $(domElement).addClass('in');
            }
        },
        getTypeOfProgramme:function(val)
        {
            var filtered= msfTypeOfProgrammes.filter(function(e){
                return e.value==val;
            });
            return filtered[0].text;
        },
        formatDateOnly(value) {
            if (value) {
                return moment(value).format('YYYY-MM-DD');
            }
        },
        removeArea(area){
            var index = _.findIndex(this.event.metadata.areas, area);
            this.event.metadata.areas.splice(index, 1);
            this.event.metadata.severity_measures.splice(index,1);
        },
        removeRegion(region){
            var index = this.areas.regions.indexOf(region);
            this.areas.regions.splice(index, 1);
        },
        removeCountry(country){
            var index = this.areas.countries.indexOf(country);
            this.areas.countries.splice(index, 1);
        },
        setupMap(mapID, respLatLng, editResp){
            var defaultLatLng = respLatLng ? respLatLng : [currentEventGeometry.coordinates[1], currentEventGeometry.coordinates[0]];
            var givenMap = L.map(mapID,{dragging: !L.Browser.mobile, tap:false});
            givenMap.scrollWheelZoom.disable();
            //Bind Autocomplete to inputs:
            function bindAutocompletes() {
                if ((!google)||(!google.maps)){
                    setTimeout(bindAutocompletes,200);
                    return;
                }
                var editField = editResp ? 'editEventRespAddress' : 'editEventAddress';
                bindACInputToMap(givenMap, editField ,true);
            }
            setTimeout(bindAutocompletes,200); // set delay for response map

            var eventMarker = L.marker(defaultLatLng).addTo(givenMap);

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
            var openStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            });

            switch (Cookies.get('MapLayer')) {
            case 'Satellite':
                mapboxTerrain.addTo(givenMap);
                break;
            case 'Terrain':
                mapboxSatellite.addTo(givenMap);
                break;
            default:
                openStreetMap_HOT.addTo(givenMap);
            }


            var baseMaps = {
                'Terrain': mapboxTerrain,
                'Satellite' : mapboxSatellite,
                'Humanitarian': openStreetMap_HOT
            };

            givenMap.on('baselayerchange', function(baselayer) {
                Cookies.set('MapLayer',baselayer.name);
            });

            var groupedOverlays = {
                'RSS Feeds': {},
                'Contacts': {}
            };

            var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

            var overlayMaps = {};

            var givenMapLayerControl = L.control.groupedLayers(baseMaps, groupedOverlays, groupOptions).addTo(givenMap);

            if (L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(givenMapLayerControl._container)
                    .disableScrollPropagation(givenMapLayerControl._container);
            } else {
                L.DomEvent.disableClickPropagation(givenMapLayerControl._container);
            }


            givenMap.on('overlayadd', function (layersControlEvent) {
                Cookies.set(layersControlEvent.name,'on');
            });

            givenMap.on('overlayremove', function (layersControlEvent) {
                Cookies.set(layersControlEvent.name,'off');
            });

            setTimeout(function() {
                givenMap.invalidateSize(true);

                if(respLatLng){ // this for the response map layer
                    givenMap.setView(respLatLng, 13);
                } else if (currentEventProperties.metadata.hasOwnProperty('bounds')) {
                    var bounds = currentEventProperties.metadata.bounds;
                    var rBounds = L.latLngBounds(L.latLng(bounds._southWest.lat,bounds._southWest.lng),L.latLng(bounds._northEast.lat,bounds._northEast.lng));
                    givenMap.fitBounds(rBounds);
                }else{
                    givenMap.setView(defaultLatLng, 13);
                }
            }, 300);

            return {givenMap, givenMapLayerControl};
        },
        //*****  Event Map section ***** //
        loadEventMap(){
            var mapObj = this.setupMap('eventMap');
            eventMap = mapObj.givenMap;
            eventMapLayerControl = mapObj.givenMapLayerControl;

            getAllEvents(mapEditGeneralEvents);

            eventMap.doubleClickZoom.disable();
            eventMap.on('dblclick', function(dblclickEvent) {
                latlng = dblclickEvent.latlng;
                $.ajax({
                    type: 'PATCH',
                    url: '/api/events/updatelocation/' + currentEventId,
                    data: JSON.stringify({location: {lat: latlng.lat, lng: latlng.lng}}),
                    contentType: 'application/json'
                }).done(function(data, textStatus, req) {
                    // setTimeout(function() {
                    //   window.location.reload(true);
                    // }, 1000);  // don't actually want it to reload
                }).fail(function(err) {
                    if (err.responseText.includes('expired')) {
                        alert('session expired');
                    }
                });
            });

        },
        loadResponsMap(){
            var vm = this;
            var respLatLng;
            if (!_.isEmpty(this.event.metadata.msf_response_location.coordinates)) {
                respLatLng = [this.event.metadata.msf_response_location.coordinates.lat, this.event.metadata.msf_response_location.coordinates.lng];
            }

            var mapObj = this.setupMap('msfResponseMap', respLatLng, true);
            $('#msfResponseMap').addClass('map-container'); /// give it dimension to populate

            msfResponseMap = mapObj.givenMap;
            msfResponseMapLayerControl = mapObj.givenMapLayerControl;

            var msfResponseMarker = L.marker(respLatLng).addTo(msfResponseMap);
            var msflatlng = null;
            msfResponseMap.on('click', function(e) {
                if (msfResponseMarker) {
                    msfResponseMap.removeLayer(msfResponseMarker);
                }
                msflatlng = e.latlng;
                Vue.set(vm.event.metadata.msf_response_location, 'coordinates', [msflatlng.lat, msflatlng.lng]);
                msfResponseMarker = L.marker(e.latlng).addTo(msfResponseMap);
            });
        },

        lintNotification(){
            if ($('#inputNotification').val()) {
                if (currentEventProperties.metadata.hasOwnProperty('notification')) {
                    if(!Array.isArray(currentEventProperties.metadata.notification)){
                        currentEventProperties.metadata.notification = [];
                    }
                    currentEventProperties.metadata.notification.push({'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val()});
                } else {
                    currentEventProperties.metadata.notification = [{'notification_time': Date.now()/1000, 'notification': $('#inputNotification').val()}];
                }
            }
        },
        lintTypes(){

            var tmpEventWithSubTypes = {};
            for(var i3= 0; i3 < this.eventTypes.length; i3++){
                if(eventTypes[i3].subTypes){
                    var tmpSubTypes = eventTypes[i3].subTypes.map(function(el){return el.value;});
                    tmpEventWithSubTypes[eventTypes[i3].value] = tmpSubTypes;
                }
            }

            var cleanSubTypes = [];
            for(var i4=0; i4<this.checkedTypes.length; i4++){
                var tmpType = tmpEventWithSubTypes[this.checkedTypes[i4]];
                if(tmpType){
                    for(var j=0; j<this.checkedSubTypes.length; j++){
                        if(tmpType.indexOf(this.checkedSubTypes[j]) > -1){
                            cleanSubTypes.push(this.checkedSubTypes[j]);
                        }
                    }
                }
            }
            this.checkedSubTypes = cleanSubTypes;
        },
        lintSubTypesSelected(){
            var tmpType = this.event.type.toString();
            var tmpSubType = this.event.sub_type;
            if ((tmpType.includes('natural_disaster') || tmpType.includes('disease_outbreak')) && tmpSubType == '') {
                alert('ensure subtype(s) is/are selected');
                this.invalid.typesSelection = true;
            }else{
                this.invalid.typesSelection = false;
            }
        },
        placeOtherFields(){
            for(key in this.otherFields){
                if(this.event.metadata.sub_type && this.event.metadata.sub_type.indexOf(`other_${key}`) != -1){

                    var subTypes = this.event.metadata.sub_type.split(',');
                    var index = _.findIndex(subTypes, function(el){
                        return el.indexOf(`other_${key}`) != -1;
                    });

                    this.otherFields[key].isSelected = true;
                    this.otherFields[key].description = subTypes[index].substring(subTypes[index].indexOf(':') + 1);

                }
            }

            if(this.event.type.indexOf('other:') != -1){
                var tmpTypes = this.event.type.split(',');
                var typeIndex = _.findIndex(tmpTypes, function(el){
                    return el.indexOf('other:') != -1;
                });

                this.otherFields.type.isSelected = true;
                this.otherFields.type.description = tmpTypes[typeIndex].substring(tmpTypes[typeIndex].indexOf(':')+1);
            }
        },
        lintOtherFields(){
            var emptyFields = [];

            for(var key in this.otherFields){
                var description = this.otherFields[key].description;

                if(this.otherFields[key].isSelected){
                    if( _.isEmpty(description) && (this.checkedTypes.indexOf(key) != -1 || key == 'type')){ // to be sure that main type was selected
                        emptyFields.push(key.replace('_', ' '));
                    }else if(this.checkedTypes.indexOf(key) != -1){
                        this.checkedSubTypes.push('other_'+key+ ': '+ description);
                    }else if(key == 'type'){
                        var index = _.findIndex(this.checkedTypes, function(el){
                            return el.indexOf('other:') != -1;
                        });

                        if(index != -1){
                            this.checkedTypes[index] = 'other: '+ description;
                        }else{
                            this.checkedTypes.push('other: '+ description);
                        }
                    }
                }
            }

            if(emptyFields.length > 0 ){
                alert(`Please enter description for other ${emptyFields.join(', ')}`);
                this.invalid.emptyStrings = true;
            }else{
                this.invalid.emptyStrings = false;
            }
        },
        lintAreas(){
            if(_.isEmpty(this.event.metadata.areas)){
                alert('Please select an area');
                this.invalid.nullAreas = true;
            }else{
                this.invalid.nullAreas = false;
            }
        },
        lintSeverity(){
            this.event.metadata.severity_measures = this.event.metadata.severity_measures.map(function(sm, index){
                return {
                    scale: $('.inputSeveritySlider').eq(index).slider('option', 'value'),
                    description: sm.description
                };
            });
        },
        submitEventSection(category){
            var vm = this;
            var body = {
                status: vm.event.status,
                type: vm.event.type.toString(),
                metadata : vm.event.metadata
            };
            $.ajax({
                type: 'PUT',
                url: '/api/events/' + currentEventId,
                data: JSON.stringify(body),
                contentType: 'application/json'
            }).done(function(data, textStatus, req){
                if(!category){
                    vm.panelEditing.Notification=false;
                }else{
                    vm.panelEditing[category] = false;
                    vm.panelDirty[category] = false;
                    vm.somePanelDirty=false;
                }
                var newStatus=body.metadata.event_status;
                if (category=='General' && (vm.oldEventStatus != newStatus))
                {
                    //uncomment here to enable the auto-analyze on status change
                    //vm.analyzeEvent();
                    $('.panel-collapse[id^=collapse]').collapse('hide');
                    setTimeout(function(){
                        $.each(vm.mapStatusToPanels[newStatus],function(index,val){
                            vm.editEvent(val, true);
                        });
                    },500);
                }
                if(category == 'Response'){
                    $('#msfResponseMap').removeClass('map-container');
                }

            }).fail(function(err) {
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                }
            });
        },
        /// consider the follow submits in a switch case
        updateSection(category){
            if(category == 'Notification' && this.newNotification){
                var newNotificationObject={
                    'notification_time': Date.now()/1000,
                    'notification': this.newNotification,
                    'username': (localStorage.getItem('username') ? localStorage.getItem('username') : 'localuser')
                };
                if (this.event.metadata.hasOwnProperty('notification') && this.event.metadata.notification.length > 0) {
                    this.event.metadata.notification.push(newNotificationObject);
                } else {
                    this.event.metadata.notification = [newNotificationObject];
                }
                this.uploadNotifications(this.submitEventSection);
            }else{
                this.submitEventSection(category);
            }
        },
        unsubscribe(){
            var vm=this;
            $.ajax({
                type: 'POST',
                url: '/api/events/unsubscribe/' + currentEventId
            }).done(function(data, textStatus, req){
                vm.event.subscribers=data.result.subscribers;
                alert('Succesfully unsubscribed.');
            }).fail(function(err) {
                alert('An error occured when unsubscribing from this event.');
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                }
            });
        },
        subscribe(){
            var vm=this;
            $.ajax({
                type: 'POST',
                url: '/api/events/subscribe/' + currentEventId
            }).done(function(data, textStatus, req){
                vm.event.subscribers=data.result.subscribers;
                alert('Succesfully subscribed.');
            }).fail(function(err) {
                alert('An error occured when subscribing to this event.');
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                }
            });
        },
        submitEventMetadata(){
            this.lintNotification();
            this.lintTypes(); // make sure if type is unselected, subtype is removed
            this.lintOtherFields(); // make sure the other string gets attached
            this.lintAreas();
            this.lintSeverity();
            this.event.type = this.checkedTypes.join();
            this.event.sub_type = this.checkedSubTypes.join();
            _.extend(this.event.metadata, {
                sub_type: this.event.sub_type,
                operational_center: this.event.metadata.msf_response_operational_centers.toString(),
            });

            this.lintSubTypesSelected();

            // body.event.type = this.event.type.toString() // make sure the other string gets attached
            if(!this.invalid.typesSelection && !this.invalid.emptyStrings && !this.invalid.nullAreas){
                this.submitEventSection('General');
            }
        },
        editEvent:function(category, suggest){
            var vm=this;
            if(suggest){
                vm.suggestEdit[category] = true;
            }

            $('#collapse'+category).collapse('show');

            if (category == 'general'){
                // this is modal implemation
                editCategory=category;
                onEditEvent();
                $( '#editModal' ).modal('show');


            } else {
                vm.panelEditing[category]=true;
                if (category=='Notification')
                {
                    if (vm.panelDirty[category])
                    {
                        vm.event.metadata.notification.pop();
                    }
                }
                else{
                    vm.panelDirty[category]=true;
                    vm.somePanelDirty=true;
                }
                // this is inline implementation
                if(category == 'General'){
                    vm.oldEventStatus= vm.event.metadata.event_status || 'monitoring';
                    vm.loadEventMap();
                    vm.placeOtherFields();
                }
                if(category == 'Response'){
                    vm.loadResponsMap();
                }
            }

        },
        stopEdit:function(category)
        {
            var vm=this;
            switch(category){
            case 'General':
                this.event.metadata = currentEventProperties.metadata;
                Vue.set(vm.event.metadata, currentEventProperties.metadata);
            }

            this.editingObj[category] = {};
            var allTextFields = $(`#fields-${category}`).find('textarea');
            var allInputFields = $(`#fields-${category}`).find('input');
            for(var atf = 0; atf < allTextFields.length; atf++){
                allTextFields[atf].value = '';
            }
            for(var aif =0; aif < allInputFields.length; aif++){
                allInputFields[aif].value = '';
            }

            vm.panelEditing[category]=false;

            if (category=='Notification')
            {
                if (vm.newNotification) {
                    vm.panelDirty[category]=true;
                    this.somePanelDirty=true;
                    var newNotificationObject={
                        'notification_time': Date.now()/1000,
                        'notification': vm.newNotification,
                        'username': (localStorage.getItem('username') ? localStorage.getItem('username') : 'localuser')
                    };
                    if (vm.event.metadata.hasOwnProperty('notification') && vm.event.metadata.notification.length > 0) {
                        vm.event.metadata.notification.push(newNotificationObject);
                    } else {
                        vm.event.metadata.notification = [newNotificationObject];
                    }
                }else{
                    vm.panelDirty[category]=false;
                }

            }else{

                vm.panelDirty[category]=false;
            }


        },
        addOtherOrg: function() {
            this.event.metadata.ext_other_organizations.push({
                name: null,
                deployment: 0,
                arrival_date: null,
            });
        },
        checkTweetScroll: function(e){
            var elem = $(e.currentTarget);

            var heightDiff = elem[0].scrollHeight - elem.scrollTop();
            var containerHeightWPadding = elem.outerHeight();

            if( heightDiff == containerHeightWPadding){
                return getTweets(vmObject.data.searchTerm, true);
            }
        },
        removeOtherOrg: function(index) {
            this.event.metadata.ext_other_organizations.splice(index, 1);
        },
        calculatePercentagePeopleAffected() {
            var percentage = (this.event.metadata.population_affected / this.event.metadata.population_total) * 100;
            this.event.metadata.percentage_population_affected = percentage.toFixed(2);
        },
        updateFigureValue(item, i) {
            this.event.metadata.keyMSFFigures[i].value = Math.pow(10, item.range);
        },
        addSelectedMSFfigures(item) {
            var newItem = { value: 0, range: 0, category: item, description: null };
            if (!_.find(this.event.metadata.keyMSFFigures, { category: item })) {
                this.event.metadata.keyMSFFigures.push(newItem);
                var index = this.keyMSFFigures.indexOf(item);
                if (index > -1) {
                    this.keyMSFFigures.splice(index, 1);
                }
            }
        },
        removeMSFfigure(item, index) {
            this.keyMSFFigures.push(item.category);
            this.event.metadata.keyMSFFigures.splice(index, 1);
        },
        removeNationalityField(index){
            this.event.metadata.msf_resource_visa_requirement.nationality.splice(index,1);

        },
        addNationalityField(){
            this.event.metadata.msf_resource_visa_requirement.nationality.push({
                iso2: 'xx',
                name: null,
                is_required:true
            });

        },
        countryChanged(country,ind) {
            var vm=this;
            var obj={
                name:country.name,
                iso2:country.iso2,
                is_required: vm.event.metadata.msf_resource_visa_requirement.nationality[ind].is_required
            };
            Vue.set(vm.event.metadata.msf_resource_visa_requirement.nationality,ind, obj);
        },
        removeResourceBudget(index) {
            this.event.metadata.msf_resource_budget.splice(index, 1);
        },
        addResourceBudget() {
            this.event.metadata.msf_resource_budget.push({
                amount: 0,
                from_who: null,
            });
        },
        updateEvent:function(eventId,body){
            $.ajax({
                type: 'PUT',
                url: '/api/events/' + eventId,
                data: JSON.stringify(body),
                contentType: 'application/json'
            }).done(function(data, textStatus, req) {
                window.location.href = '/events/?eventId=' + eventId;
            }).fail(function(err) {
                if (err.responseText.includes('expired')) {
                    alert('session expired');
                }
            });
        },
        uploadNotifications:function(callback) {
            var vm=this;
            var files=document.getElementById('inputNotificationUpload').files;
            var imgLink='';

            if (files && files[0]) {
                $('#dialogModalTitle').html('Uploading attachment(s)...');
                $('#dialogModal').modal('show');
                var imgFileName=files[0].name;
                var fileType=files[0].type;
                var photo=files[0];
                $.ajax({
                    url : '/api/utils/uploadurl',
                    data: {'filename': imgFileName, key:('event/'+currentEventId)},
                    type : 'GET',
                    dataType : 'json',
                    cache : false,
                }).then(function(retData) {
                    imgLink=retData.url;
                    $.ajax({
                        url : retData.signedRequest,
                        type : 'PUT',
                        data : photo,
                        dataType : 'text',
                        cache : false,
                        //contentType : file.type,
                        processData : false,
                        success: function(data) {
                            var lastNotification=getLatestNotification(vm.event.metadata.notification);
                            lastNotification['notificationFileUrl']= imgLink;
                            $('#dialogModal').modal('hide');
                            callback();
                        }
                    });
                }).fail(function(err){
                    //$('#statusFile'+this.sssFileNo).html(glbFailedHTML+' failed to upload '+this.sssFileName+' <br>');
                    $('#dialogModalBody').html('An error ' + err + ' occured while uploading the photo.');
                });
            } else {
                callback();
            }
        },
        saveEventEdits:function(){
            this.uploadNotifications(this.submitEventMetadata);
        },
        cancelEventEdits:function(){
            if (confirm('NOTE: all unsaved data in other panels (if any) will be lost.\nAre you sure you want to cancel edits ? '))
                window.location.href = '/events/?eventId=' + currentEventId;
        },
        analyzeEvent: function (){
            $('#analyticsStatusModal').modal('show');
            vmAnalytics.$mount('#analysisResultVue');
            vmAnalytics.isAnalyzing=true;
            var evBody = {
                status: (this.event.metadata.event_status === 'complete' ? 'inactive' : 'active'),
                type: this.event.type.toString(),
                metadata : this.event.metadata,
                created_at: this.event.created_at,
                location: {lat: currentEventGeometry.coordinates[1],lng: currentEventGeometry.coordinates[0]}
            };
            vmAnalytics.analyzeEvent(evBody);
        },

        updateMarkdown: _.debounce(function(e){
            this.newNotification = e.target.value;
        }, 300),
        openMarkdownSyntax: function(){
            $('#markdownModal').modal('show');
        },
        sendSubscInvite:function()
        {
            var vm=this;
            //send invite here
            var body={
                invitees: vm.selectedInvitees
            };

            vm.msLoading=true;
            $.ajax({
                type: 'POST',
                url: '/api/events/invitesubscribe/' + vm.event.id,
                data: JSON.stringify(body),
                contentType: 'application/json'
            }).done(function(data, textStatus, req) {
                vm.msLoading=false;
                alert('Invitation sent to the selected users.');
                vm.selectedInvitees=[];

            }).fail(function(err) {
                vm.msLoading=false;
                alert('An error occured when sending invitations. '+(err.responseText.includes('expired') ? 'session expired':''));
            });
        }

    },
    computed:{
        reversedNotifications:function() {
            //will keep the sorting here for UI
            return (this.event.metadata.notification && this.event.metadata.notification.length > 0) ? this.event.metadata.notification.slice().sort((a,b) => {
                return b.notification_time - a.notification_time;
            }).map(item => {
                return Object.assign({}, item, {notification: marked(item.notification, {sanitize: true})});
            }): [];
        },
        notStr:function(){
            let lastNotification = getLatestNotification(this.event.metadata.notification);
            return (lastNotification) ? marked(lastNotification.notification, {sanitize: true}) +
            (lastNotification.hasOwnProperty('username') ? ('<br/>' + lastNotification.username) : '') +
            ' @ ' + (new Date(lastNotification.notification_time*1000)).toLocaleTimeString().replace(/:\d{2}$/,'') : '(none)';
        },
        eventLink:function(){
            return WEB_HOST + 'events/?eventId=' + this.event.id;
        },
        eventReportLink:function()
        {
            return WEB_HOST + 'report/?eventId=' + this.event.id + '&reportkey=' + this.event.reportkey + '#' + this.event.metadata.name;
        },

        compiledMarkdown: function(){
            return marked(this.newNotification, {sanitize: true});
        },
        markedNotification: function(chunk){
            return marked(chunk, {sanitize: true});
        }
    },
    watch: {
        areas: function(val){
            var vm=this;
            var mostRecentSlider = $('.inputSeveritySlider').eq($('.inputSeveritySlider').length);
            var filled = mostRecentSlider.has('span.ui-slider-handle').length;

            if(filled == 0){

                if(vm.event.metadata.areas.length > vm.event.metadata.severity_measures.length){
                    var mockSeverity = {scale: 2, description: ''};
                    vm.event.metadata.severity_measures.push(mockSeverity);

                    setTimeout(function(){

                        $('.inputSeveritySlider').last().slider({
                            min: 1, max: 3, step: 1, value: 2
                        }).each(function() {
                            var vals = 3-1;
                            for (var i = 0; i <= vals; i++) {
                                var el = $('<label>'+severityLabels[i]+'</label>').css('left',(i/vals*100)+'%');
                                $(this).append(el);
                            }
                        });

                    }, 300);
                }

            }

        }
    }
};

var analyticsMap;

var vmAnalytics = new Vue({

    data: {
        isAnalyzed:false,
        vizalyticsError: false,
        isAnalyzing: false,
        hasSubmissionError:false,
        submissionErrorMsg:'',
        response:{}

    },
    methods:{
        resetSubmission:function(){
            this.isAnalyzed=false;
            this.vizalyticsError=false;
            this.isAnalyzing =false;
            this.hasSubmissionError = false;
            this.submissionErrorMsg ='';
            this.response={};
        },
        analyzeEvent:function(evBody)
        {
            var vm=this;
            vm.isAnalyzing=true;
            vmEventDetails.isAnalyzing=true;
            $.ajax({
                type: 'POST',
                url: '/api/analytics/analyze',
                data: JSON.stringify(evBody),
                contentType: 'application/json'
            }).done(function( data, textStatus, req ){

                vm.response=data;
                vmEventDetails.hasBeenAnalyzed=true;
                vmEventDetails.vizalyticsResp=data.results[0].data;
                vmEventDetails.analyzedTimeTxt='Performed @'+(new Date()).toString();
                vmEventDetails.isAnalyzing=false;
                vm.isAnalyzing=false;
                vm.isAnalyzed=true;
                //vm.mapAnalysisResult();

                /* disbale collapse /uncollapse based on AI result
                $('.panel-collapse[id^=collapse]').collapse('hide');
                $('#collapseResponse').on('hidden.bs.collapse', function(){
                    if (vmEventDetails.vizalyticsResp.supplies.length>0)
                        $('#collapseResponse').collapse('show');
                });
                $('#collapseResources').on('hidden.bs.collapse', function(){
                    if (vmEventDetails.vizalyticsResp.contacts.length>0)
                        $('#collapseResources').collapse('show');
                });
                */


                //console.log(data);
            }).fail(function (reqm, textStatus, err){
                vmEventDetails.isAnalyzing=false;
                vm.isAnalyzing=false;
                vm.vizalyticsError=true;
                //console.log(err);

            });


        },
        mapAnalysisResult:function(){
            if (analyticsMap)
                analyticsMap.remove();
            analyticsMap = L.map('analyticsMap',{dragging: !L.Browser.mobile, tap:false, doubleClickZoom:false});

            // To get healthsites loaded, need to first add load event and then setView separately

            //analyticsMap.fitBounds([[-13, 84],[28,148]]);

            // Add some base tiles
            var anMapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
                attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
                minZoom: 0,
                maxZoom: 18
            });

            // Add some satellite tiles
            var anMapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
                attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
            });

            // OSM HOT tiles
            var anOpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            });

            switch (Cookies.get('MapLayer')) {
            case 'Satellite':
                anMapboxSatellite.addTo(analyticsMap);
                break;
            case 'Terrain':
                anMapboxTerrain.addTo(analyticsMap);
                break;
            default:
                anOpenStreetMap_HOT.addTo(analyticsMap);
            }


            var analyticsBaseMaps = {
                'Terrain': anMapboxTerrain,
                'Satellite' : anMapboxSatellite,
                'Humanitarian': anOpenStreetMap_HOT
            };

            analyticsMap.on('baselayerchange', function(baselayer) {
                Cookies.set('MapLayer',baselayer.name);
            });

            var groupedOverlays = {
                'RSS Feeds': {},
                'Contacts': {}
            };


            var groupOptions = {'groupCheckboxes': true, 'position': 'bottomleft'};

            var layerControl = L.control.groupedLayers(analyticsBaseMaps,groupedOverlays, groupOptions).addTo(analyticsMap);

            if (L.Browser.touch) {
                L.DomEvent
                    .disableClickPropagation(layerControl._container)
                    .disableScrollPropagation(layerControl._container);
            } else {
                L.DomEvent.disableClickPropagation(layerControl._container);
            }

            if (this.response.results)
            {
                var analysisLayer=L.geoJSON(this.response.results[0].geo, {
                }).bindPopup(function (layer) {

                    return (layer.feature.properties.type || layer.feature.properties.name) ;
                });

                try {
                    analysisLayer.addTo(analyticsMap);
                    analyticsMap.fitBounds(analysisLayer.getBounds());
                } catch (err) {
                    console.log(err); // eslint-disable-line no-console
                }

            }

        }//function

    },
    mounted: function(){

    }
});
