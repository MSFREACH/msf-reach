/*eslint no-unused-vars: off*/

var newEventMap = L.map('newEventMap').setView([20, 110], 4);

$('#newEventModal').on('shown.bs.modal', function() {
    _.defer(newEventMap.invalidateSize.bind(newEventMap));
});

$('#newEventModal').on('hidden.bs.modal', function() {
    // clear previous entry
    $('#selectType').val('');
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
    newEventMap.removeLayer(marker);
    newEventMap.setView([20,110], 4);
    latlng = null;
});

var autocompleteMap=newEventMap;

// Add some base tiles
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

var marker;
var latlng = null;
newEventMap.on('click', function(e) {
    if(marker)
        newEventMap.removeLayer(marker);
    latlng = e.latlng; // e is an event object (MouseEvent in this case)
    marker = L.marker(e.latlng).addTo(newEventMap);
});



var refreshLandingPage = function() {
    var saveCookie = Cookies.get('Current Events');
    landingMap.removeLayer(eventsLayer);
    layerControl.removeLayer(eventsLayer);
    eventsLayer.clearLayers();
    $('#eventProperties').empty();
    Cookies.set('Current Events',saveCookie);
    getAllEvents(mapAllEvents);
    $('#eventTab').tab('show');
};


$(function(){
    $( '#inputEvDateTime' ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd',
        yearRange: '1900:' + new Date().getFullYear()
    });


    $('#createEvent').on('click', function (e) {

        if (latlng === null){
            alert('Please select the epicenter of the event using the map.');
        }
        else {
            var sub_type = $('#inputDisasterType').val() || $('#inputDiseaseType').val()  || $('#inputOther').val();
            var body = {
                'status': 'active',
                'type': $('#selectType').val(),
                'created_at': new Date().toISOString(),
                'location': latlng,
                'metadata':{
                    'user': localStorage.getItem('username'),
                    'name': (sub_type != '' ? sub_type : $('#selectType').val() ) + '_' + $('#inputEvDateTime').val(),
                    'sub_type': sub_type,
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
            $.ajax({
                type: 'POST',
                url: '/api/events',
                data: JSON.stringify(body),
                contentType: 'application/json'
            }).done(function( data, textStatus, req ){
                // var eventId = data.result.objects.output.geometries[0].properties.id;
                $('#newEventModal').modal('hide');
                refreshLandingPage();
            }).fail(function (reqm, textStatus, err){
                if (reqm.responseText.includes('expired')) {
                    alert('session expired');
                } else {
                    alert('error creating event' + err);
                }});
        }
    });

    $('#nextEventTab').on('click',function(){
        $('#extraTab').tab('show');
    });


    $('#selectType').change(function(){
        $('#divNaturalDisaster').toggle(this.value == 'natural_hazard');
        if (this.value != 'natural_hazard') $('#inputDisasterType').val('');

        $('#divDisease').toggle(this.value == 'epidemiological');
        if (this.value != 'epidemiological')
            $('#inputDiseaseType').val('');


        $('#divOther').toggle(this.value == 'other');
        //$("#inputName").val(this.value.replace('_',' ')+" "+$("#inputEvDateTime").val());
    });


    $('#inputDisasterType , #inputDiseaseType').change(function(){
        $('#divOther').toggle(!this.value);
        if (this.value)
            $('#inputOther').val('');
    });


});
