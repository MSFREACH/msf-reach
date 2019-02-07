/*eslint no-unused-vars: off*/

//var newEventMap = L.map('newEventMap').setView([20, 110], 4);
function clearGlobalVars(){
    // clear global vars
    if (report_id_for_event) {
        report_id_for_event = null;
        // this was from a report, clear that row and refresh reports on map
        $('#reports-table-row-'+report_id_for_event).remove();
        getReports(mainMap, mapReports);
    }
    if (latlng) {
        latlng=null;
    }
    if (areaSelect) {
        areaSelect.remove();
        areaSelect=null;
    }
    // clear previous entry
    $('#selectType').val('');
    $('#inputEventName').val('');
    $('#inputEventDescription').val('');
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
    $('#inputProjectCode').val('');
    //uncheck checkboxes:
    $('.newSubEventTypeBox').prop('checked',false);
    $('.newEventTypeBox').prop('checked',false);

    $('#reportsContainer').html('');
    getReports(mainMap, mapReports);

}

$('#newEventModal').on('hidden.bs.modal', function() {
    clearGlobalVars();

});


$('#analyticsModal').on('hidden.bs.modal', function() {
    clearGlobalVars();
});

$('#analyticsModal').on('shown.bs.modal', function(){
    $('body').addClass('modal-open');
});

// Add some base tiles
/*
var NEmapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/msfhk/cjqyk9p1c9r6o2rscym6nt90f/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXNmaGsiLCJhIjoiY2pxdnp0N3E2MTBwZDQybWhtMGw2aWljYSJ9.I6nmYZcm6p77JgxlITRfpQ', {
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
// var marker;

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
    var saveCookie = Cookies.get('Ongoing MSF Responses');
    mainMap.removeLayer(eventsLayer);
    layerControl.removeLayer(eventsLayer);
    eventsLayer.clearLayers();
    $('#ongoingEventProperties').empty();
    $('#watchingEventProperties').empty();
    Cookies.set('Ongoing MSF Responses',saveCookie);
    getAllEvents(mapAllEvents);
    $('watchingTab').tab('show');
};

// various input related functions
$(function(){
    // set up #inputEvDateTime as a date time picker element
    $( '#inputEvDateTime' ).datetimepicker({
        //controlType: 'select',
        format: 'YYYY-MM-DD HH:mm'
        //yearRange: '1900:' + new Date().getFullYear()
    });

    // create a new event - get the values and store them using a POST
    $('#createEvent').on('click', function (e) {



        if (areaSelect === null && !latlng ){
            alert('Please select the epicenter of the event using the map.');
        }
        else {
            var sub_type = $('input[class=newSubEventTypeBox]:checked').map(
                function () {return this.value;}).get().join(',');
            var subTypes = $('input[class=newSubEventTypeBox]:checked').map(
                function () {return this.value;}).get();

            var types = $('input[class=newEventTypeBox]:checked').map(
                function () {return this.value;}).get();
            if ($('input[id=selectType6]:checked')){
                var iO = _.findIndex(types, function(el){
                    return el.indexOf('other') != -1;
                });
                types[iO] = 'other: ' + $('#inputOther').val();
                // console.log(' 000 EVENT CREATess ----- ', types[iO],  $('#inputOther').val());

            }
            // console.log('111 EVENT CREATess ----- ', types );
            var body = {
                'status': 'active',
                'type': types.join(','),
                'created_at': new Date().toISOString(),
                'location': (areaSelect ? areaSelect.getBounds().getCenter().wrap() : latlng),
                'subscribe': $('#inputSubscribe').is(':checked'),
                'metadata':{
                    'user': localStorage.getItem('username'),
                    'name': $('#inputEventName').val(),
                    'description': $('#inputEventDescription').val(),
                    'sub_type': subTypes.join(', '),
                    'event_datetime': $('#inputEvDateTime').val(),
                    'event_status': $('#inputEvStatus').val(),
                    'incharge_name': $('#inputInChargeName').val(),
                    'incharge_position': $('#inputInChargePosition').val(),
                    'severity':  $('#inputSeverity').val(),
                    'severity_scale': $('#inputSeverityScale').slider('option', 'value'),
                    'severity_measures': [{
                        'scale' : $('#inputSeverityScale').slider('option', 'value'),
                        'description': $('#inputSeverity').val()
                    }],
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

            if (areaSelect) {
                body.metadata['bounds'] = L.latLngBounds([areaSelect.getBounds().getSouthWest().wrap(), areaSelect.getBounds().getNorthEast().wrap()]);
            }

            // add report id if creating from existing report
            if (report_id_for_event) {
                body['report_id'] = report_id_for_event;
            }
            if ((body.type.includes('natural_disaster') || body.type.includes('disease_outbreak')) && body.metadata.sub_type === '') {
                alert('ensure subtype(s) is/are selected');
            } else if (body.type==='') {
                alert('ensure type(s) is/are selected');
            } else {
                $('#newEventModal').modal('hide');
                $('#analyticsModal').modal('show');
                vmAnalytics.$mount('#analysisResultVue');
                vmAnalytics.isSubmitting=true;

                $.ajax({
                    type: 'GET',
                    url: '/api/events/',
                    data: {
                        geoformat : 'geojson',
                        //status: 'active',
                        lng: body.location.lng,
                        lat: body.location.lat
                    },
                    contentType: 'application/json'
                }).done(function( data, textStatus, req ){
                    vmAnalytics.isSubmitting=false;
                    vmAnalytics.nearByEvents=data.result.features;
                    if (!(data.result.features.length))
                    {
                        vmAnalytics.submitAndAnalyze(body);
                        vmAnalytics.hasNearBys=false;
                    }
                    else
                    {
                        vmAnalytics.toSubmitBody=body;
                        vmAnalytics.hasNearBys=true;
                    }
                    //console.log(data);
                }).fail(function (reqm, textStatus, err){
                    vmAnalytics.isSubmitting=false;
                    vmAnalytics.hasSubmissionError=true;

                });
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
            $(this).val(`other_disease_outbreak: ${diseaseTxt}`);
        }

        if($(this).attr('id') == 'disasterType7') {
            $('#divOtherDisaster').css('display', (this.checked ? '' : 'none'));
            var disasterTxt = $('#disasterType8').val();
            $(this).val(`other_natural_disaster: ${disasterTxt}`);
        }
    });

    $('.form-control').focusout(function () {
        if($(this).attr('id') == 'disasterType8') {
            var disasterTxt = $(this).val();
            $('#disasterType7').val(`other_natural_disaster: ${disasterTxt}`);
        }

        if($(this).attr('id') == 'diseaseType8') {
            var diseaseTxt = $(this).val();
            $('#diseaseType7').val(`other_disease_outbreak: ${diseaseTxt}`);
        }
    });


});
var analyticsMap;

var vmAnalytics = new Vue({

    data: {
        isSubmitting:false,
        isAnalyzed:false,
        isEventCreated:false,
        vizalyticsError: false,
        isAnalyzing: false,
        hasNearBys:false,
        hasSubmissionError:false,
        showNearByEvents:true,
        submissionErrorMsg:'',
        nearByEvents:[],
        response:{}

    },
    methods:{
        resetSubmission:function(){
            clearGlobalVars();
            this.isSubmitting=false;
            this.isAnalyzed=false;
            this.isEventCreated=false;
            this.vizalyticsError=false;
            this.isAnalyzing =false;
            this.hasNearBys= false;
            this.showNearByEvents=true,
            this.hasSubmissionError = false;
            this.submissionErrorMsg ='';
            this.nearByEvents=[];
            this.response={};
            //console.log('cleared');
        },
        submitAndAnalyze:function(evBody)
        {
            var vm=this;
            vm.isSubmitting=true;
            vm.showNearByEvents=false;
            $.ajax({
                type: 'POST',
                url: '/api/events',
                data: JSON.stringify(evBody),
                contentType: 'application/json'
            }).done(function( data, textStatus, req ){
            // var eventId = data.result.objects.output.geometries[0].properties.id;
                refreshLandingPage();
                vm.isEventCreated=true;
                vm.isSubmitting=false;
                return; //killing analytics on event creation
                /*
                vm.isAnalyzing=true;
                $.ajax({
                    type: 'POST',
                    url: '/api/analytics/analyze',
                    data: JSON.stringify(evBody),
                    contentType: 'application/json'
                }).done(function( data, textStatus, req ){

                    vm.response=data;
                    vm.isAnalyzing=false;
                    vm.isAnalyzed=true;
                    vm.mapAnalysisResult();

                //console.log(data);
                }).fail(function (reqm, textStatus, err){
                    vm.isAnalyzing=false;
                    vm.vizalyticsError=true;

                });
                */

            }).fail(function (reqm, textStatus, err){
                vm.isSubmitting=false;
                vm.hasSubmissionError=true;
                if (reqm.responseText.includes('expired')) {
                    vm.submissionErrorMsg='session expired';
                }});


        },
        mapAnalysisResult:function(){
            if (analyticsMap)
                analyticsMap.remove();
            analyticsMap = L.map('analyticsMap',{dragging: !L.Browser.mobile, tap:false, doubleClickZoom:false});

            // To get healthsites loaded, need to first add load event and then setView separately

            //analyticsMap.fitBounds([[-13, 84],[28,148]]);

            // Add some base tiles
            var anMapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/msfhk/cjqyk9p1c9r6o2rscym6nt90f/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXNmaGsiLCJhIjoiY2pxdnp0N3E2MTBwZDQybWhtMGw2aWljYSJ9.I6nmYZcm6p77JgxlITRfpQ', {
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
        //console.log('mounted');
        // Create map
    }
});
