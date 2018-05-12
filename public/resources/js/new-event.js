/*eslint no-unused-vars: off*/

//var newEventMap = L.map('newEventMap').setView([20, 110], 4);

$('#newEventModal').on('hidden.bs.modal', function() {
    // clear previous entry
    $('#selectType').val('');
    $('#inputEventName').val('');
    $('#inputDisasterType').val('');
    $('#mapAddress').val('');
    $('#inputDiseaseType').val('');
    $('#inputOther').val('');
    $('#inputEvDateTime').val('');
    $('#inputEvStatus').val('');
    $('#inputInChargeName').val('');
    $('#inputInChargePosition').val('');
    $('#inputSeverity').val('');
    $('#inputSeverityScale').val('2');
    $('#inputSharepointLink').val('');
    $('#inputSecurity').val('');
});

$('#analyticsModal').on('shown.bs.modal', function(){
    $('body').addClass('modal-open');
});

// Add some base tiles
/*
var NEmapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
}).addTo(newEventMap);

// Add some satellite tiles
var NEmapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

var NEbaseMaps = {
    'Terrain': NEmapboxTerrain,
    'Satellite' : NEmapboxSatellite
};

var NEoverlayMaps = {};

 var NElayerControl = L.control.layers(NEbaseMaps, NEoverlayMaps, {'position':'bottomleft'}).addTo(newEventMap);
*/
var marker;
var latlng = null;
/*
newEventMap.on('click', function(e) {
    if(marker)
        newEventMap.removeLayer(marker);
    latlng = e.latlng; // e is an event object (MouseEvent in this case)
    marker = L.marker(e.latlng).addTo(newEventMap);
});

*/

/**
 * refresh the landing page to show up a new event
 * @function refreshLandingPage
 */
var refreshLandingPage = function() {
    var saveCookie = Cookies.get('Ongoing MSF Projects');
    mainMap.removeLayer(eventsLayer);
    layerControl.removeLayer(eventsLayer);
    eventsLayer.clearLayers();
    $('#ongoingEventProperties').empty();
    $('#watchingEventProperties').empty();
    Cookies.set('Ongoing MSF Projects',saveCookie);
    getAllEvents(mapAllEvents);
    $('watchingTab').tab('show');
};

// various input related functions
$(function(){
    // set up #inputEvDateTime as a date time picker element
    $( '#inputEvDateTime' ).datetimepicker({
        //controlType: 'select',
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        yearRange: '1900:' + new Date().getFullYear()
    });

    // create a new event - get the values and store them using a POST
    $('#createEvent').on('click', function (e) {

        if (latlng === null){
            alert('Please select the epicenter of the event using the map.');
        }
        else {
            var sub_type = $('input[class=newSubEventTypeBox]:checked').map(
                function () {return this.value;}).get().join(',');
            var body = {
                'status': 'active',
                'type': $('input[class=newEventTypeBox]:checked').map(
                    function () {return this.value;}).get().join(','),
                'created_at': new Date().toISOString(),
                'location': latlng,
                'metadata':{
                    'user': localStorage.getItem('username'),
                    'name': $('#inputEventName').val(),
                    'sub_type': sub_type,
                    'bounds': mainMap.getBounds(),
                    'event_datetime': $('#inputEvDateTime').val(),
                    'event_status': $('#inputEvStatus').val(),
                    'incharge_name': $('#inputInChargeName').val(),
                    'incharge_position': $('#inputInChargePosition').val(),
                    'severity':  $('#inputSeverity').val(),
                    'severity_scale': $('#inputSeverityScale').slider('option', 'value'),
                    'sharepoint_link':  $('#inputSharepointLink').val(),
                    'security_details': $('#inputSecurity').val(),
                    /* Exploratory details: free text, ask user for
					* "Main results of the exploratory mission"
					*/
                    'exploratory_details': $('#inputExploratoryDetails').val(),
                    'operational_center': $('#inputOpCenter').val(), // check box with only one of OCA/OCBA/OBG/OCB/OCP ticked
                    'other_orgs': $('#inputOtherOrgs').val(), // other organisations, free text
                    'deployment': $('#inputDeployment').val(), // deployment details, free text
                    'capacity': $('#inputCapacity').val(), // capacity, free text
                    /* For next two items have asked for
					* Check Boxes + exact number of medical supply + date of arrival
					* but not listed anything, so leave as free text
					*/
                    'medicalMaterials': $('#inputMedicalMaterials').val(),
                    'nonMedicalMaterials': $('#inputNonMedicalMaterials').val(),
                    'population_total': $('#inputPopulationTotal').val(), // total population in area affected
                    'population_affected': $('#inputPopulationAffected').val() // population affected
                    /* Note need to display % but we can
					* calcuate and display this on events page
					* from above two variables
					*/
                }
            };
            if ((body.type.includes('natural_hazard') || body.type.includes('epidemiological')) && body.metadata.sub_type === '') {
                alert('ensure subtype(s) is/are selected');
            } else if (body.type==='') {
                alert('ensure type(s) is/are selected');
            } else {
                $('#newEventModal').modal('hide');
                $('#analyticsModal').modal('show');
                $('#submissionStatusDiv').html('<div class="msf-loader"></div>');
                $.ajax({
                    type: 'POST',
                    url: '/api/events',
                    data: JSON.stringify(body),
                    contentType: 'application/json'
                }).done(function( data, textStatus, req ){
                    // var eventId = data.result.objects.output.geometries[0].properties.id;
                    refreshLandingPage();
                    $('#submissionStatusDiv').html('<span class="glyphicon glyphicon-check" style="color:green;"></span> Event successfully created.');
                    $('#vizalyticsDiv').html('<span>Analyzing event ...</span> <div class="msf-loader"></div>');
                    $.ajax({
                        type: 'POST',
                        url: '/api/analytics/analyze',
                        data: JSON.stringify(body),
                        contentType: 'application/json'
                    }).done(function( data, textStatus, req ){
                        $('#vizalyticsDiv').html('');
                        vmAnalytics.response=data;
                        vmAnalytics.$mount('#analysisResultVue');

                        //console.log(data);
                    }).fail(function (reqm, textStatus, err){
                        $('#vizalyticsDiv').html('<span class="glyphicon glyphicon-remove-circle" style="color:red;"></span> Error in analyzing event.');

                    });


                    //console.log(body);
                }).fail(function (reqm, textStatus, err){
                    $('#submissionStatusDiv').html('<span class="glyphicon glyphicon-remove-circle" style="color:red;"></span> Error in event creation');
                    if (reqm.responseText.includes('expired')) {
                        $('#submissionStatusDiv').append(': <span>session expired</span>');
                    }});
            }
        }
    });

    $('#nextEventTab').on('click',function(){
        $('#extraTab').tab('show');
    });


    //hide/show div containers of subtypes and other text input if their relevant checkbox is true
    $('.newEventTypeBox').change(function () {
        //console.log(this.checked);
        //console.log($(this).attr('id'));

        //console.log($('input[class=newEventTypeBox]:checked').map(
        //    function () {return this.value;}).get().join(', '));

        if($(this).attr('id') == 'selectType4') {
            $('#divNaturalDisaster').css('display', (this.checked ? '' : 'none'));
        }

        if($(this).attr('id') == 'selectType1') {
            $('#divDisease').css('display', (this.checked ? '' : 'none'));
        }

        if($(this).attr('id') == 'selectType6') {
            $('#divOther').css('display', (this.checked ? '' : 'none'));
        }
    });

    $('.newSubEventTypeBox').change(function () {
        if($(this).attr('id') == 'diseaseType7') {
            $('#divOtherDisease').css('display', (this.checked ? '' : 'none'));
            var diseaseTxt = $('#diseaseType8').val();
            $(this).val(diseaseTxt);
        }

        if($(this).attr('id') == 'disasterType7') {
            $('#divOtherDisaster').css('display', (this.checked ? '' : 'none'));
            var disasterTxt = $('#disasterType8').val();
            $(this).val(disasterTxt);
        }
    });

    $('.form-control').focusout(function () {

        //console.log($(this).attr('id'));

        if($(this).attr('id') == 'disasterType8') {
            var disasterTxt = $(this).val();
            $('#disasterType7').val(disasterTxt);
            //console.log(disasterTxt);
        }

        if($(this).attr('id') == 'diseaseType8') {
            var diseaseTxt = $(this).val();
            $('#diseaseType7').val(diseaseTxt);
            //console.log(diseaseTxt);
        }
    });


});
var analyticsMap;

var vmAnalytics = new Vue({

    data: {

    },
    mounted: function(){
        //console.log('mounted');
        // Create map
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

        if (this.response.results)
        {
            var analysisLayer=L.geoJSON(this.response.results[0].geo, {
            }).bindPopup(function (layer) {

                return (layer.feature.properties.type || layer.feature.properties.name) ;
            });
            analysisLayer.addTo(analyticsMap);
            analyticsMap.fitBounds(analysisLayer.getBounds());

        }
    }
});
