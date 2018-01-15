/*eslint no-unused-vars: off*/

// Create map
var newReportMap = L.map('map').setView([20, 110], 4);
var autocompleteMap=newReportMap;
newReportMap.locate({setView: true, maxZoom: 16});
// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
}).addTo(newReportMap);

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

var baseMaps = {
    'Terrain': mapboxTerrain,
    'Satellite' : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'topright'}).addTo(newReportMap);

var marker;
var latlng = null;
newReportMap.on('click', function(e) {
    if(marker)
        newReportMap.removeLayer(marker);
    latlng = e.latlng; // e is an event object (MouseEvent in this case)
    marker = L.marker(e.latlng).addTo(newReportMap);
});

function postReport(eventID,reportKey,imgLink) {
    var body = {
        'eventId': eventID,
        'status': 'confirmed',
        'created': new Date().toISOString(),
        'reportkey': reportKey,
        'location':latlng,
        'content':{
            'report_tag': $('.rtype-selected').attr('data-msf-value'),
            'username/alias':$('#inputReportUserName').val(),
            'description':$('#inputReportText').val(),
            'image_link': imgLink
        }
    };
    //console.log(body);
    $.ajax({
        type: 'POST',
        url: '/api/reports',
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
        $('#divProgress').html('Report submitted!');
        $('#divSuccess').show(500);
    }).fail(function (req, textStatus, err){
        $('#divProgress').html('An error occured');
        console.log(err); // eslint-disable-line no-console
        console.log(textStatus); // eslint-disable-line no-console
    });
}


$('#createReport').on('click', function (e) {
    var eventId = getQueryVariable('eventId');
    var reportKey = getQueryVariable('reportkey');

    if ((!eventId)||(!reportKey))
    {
        alert('EventId and/or reportKey missing in the URL. Please verify and try again.');
    }

    var imgLink='';

    if (latlng !== null ) {
        $('#divProgress').html('Submitting your report...');
        var files=document.getElementById('inputImageUpload').files;

        if (files && files[0])
        {
            var imgFileName=files[0].name;
            var fileType=files[0].type;
            var photo=files[0];
            $.ajax({
                url : '../api/utils/uploadurl',
                data: 'filename='+imgFileName,// + '&mime=' + fileType,
                type : 'GET',
                dataType : 'json',
                cache : false,
            })
                .then(function(retData) {
                    imgLink=retData.url;
                    return $.ajax({
                        url : retData.signedRequest,
                        type : 'PUT',
                        data : photo,
                        dataType : 'text',
                        cache : false,
                        //contentType : file.type,
                        processData : false,
                    });
                }).then(function(data,txt,jq){

                    postReport(eventId,reportKey,imgLink);
                })
                .fail(function(err){
                    //$('#statusFile'+this.sssFileNo).html(glbFailedHTML+' failed to upload '+this.sssFileName+' <br>');
                    $('#divProgress').html('An error ' + err + ' occured while uploading the photo.');
                });

        }else {//no image just submit the report
            postReport(eventId,reportKey,imgLink);
        }//else


    }
});
