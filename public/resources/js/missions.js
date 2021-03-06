/*eslint no-unused-vars: off*/

function openMissionPopup(id) {
    missionsLayer.eachLayer(function(layer){
        if (layer.feature.properties.id == id)
        {
            if (missionsClusters.hasLayer(layer))
                missionsClusters.zoomToShowLayer(layer);
            layer.openPopup(mainMap.center);
        }
    });
}


// Load Missions to missions table tab
var loadMissions = function(err, missions) {
    if (err) {
        alert('Error loading missions: ' + err);
    } else {

        $('#missionsContainer').html('<ul class="table table-hover" id="missionsTable">');

        $.each(missions, function(key, value) {
            $('#missionsTable').append(
                '<li id=\'mrow'+value.properties.id+'\' class=\'cursorPointer\' onclick=\'openMissionPopup('+value.properties.id+')\'>'
        +'<span><a href=\'#\' onclick=\'onMissionLinkClick(' +
          value.properties.id +
          ')\' class=\'contact-link btn btn-sm btn-primary\' title=\'Quick View\'><i class=\'glyphicon glyphicon-eye-open\'></i>Open</a></span><div class="title">' +
          value.properties.properties.name +
          '</div><div class="description">' +
          value.properties.properties.description +
          '</div><span><label>Region  </label>' +
          value.properties.properties.region +
          '</span><span><label>Start  </label>' +
          (convertToLocaleDate(value.properties.properties.event_datetime) || value.properties.properties.startDate + '(old format please edit)'  )+
          '</span ><span>' + (value.properties.properties.finishDate ? '<label>End date of MSF response </label>' : '<label>Closure date of event </label>') +
          (value.properties.properties.finishDate || convertToLocaleDate(value.properties.properties.event_datetime_closed)  + '(old format please edit)' ) +
          '</span><div><label>Severity  </label>' +
          value.properties.properties.severity +
          '</div><div><label>Capacity </label>' +
          value.properties.properties.capacity +
          '</div></li>'
            );
        });

        $('#missionsTable').append('</tbody></table>');
    }
};

// Perform GET call to get Missions
var getMissions = function(term) {

    var url='/api/missions?geoformat=geojson' +(term ? ('&search='+term) :'');
    var wrappedBounds=getWrappedLatLng(mainMap.getBounds());
    url = url+'&lngmin='+wrappedBounds.lngmin+'&latmin='+wrappedBounds.latmin+'&lngmax='+wrappedBounds.lngmax+'&latmax='+wrappedBounds.latmax;
    $.getJSON(
        url,
        function(data) {
            loadMissions(null, data.result.features);
            mapMissions(data.result);
            missionsLayer.eachLayer(function(layer) {
                layer.on('mouseover',function(e){$('#mrow'+layer.feature.properties.id).addClass('isHovered');});
                layer.on('mouseout',function(e){$('#mrow'+layer.feature.properties.id).removeClass('isHovered');});
                layer.on('touchstart',function(e){$('#mrow'+layer.feature.properties.id).addClass('isHovered');});
                layer.on('touchend',function(e){$('#mrow'+layer.feature.properties.id).removeClass('isHovered');});
            });
        }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            loadMissions(err.responseText, null);
        }
    });
};


// variables for mission data
var missionData = {};
var missionCoordinates = {};
var currentMissionId=0;
var currentMissionEventId=0;

// open mission modal on click
var onMissionLinkClick = function(id) {
    $.getJSON('/api/missions/' + id, function(data) {
        currentMissionId=id;
        currentMissionEventId=data ? data.result.objects.output.geometries[0].properties.event_id : null;
        missionData = data ? data.result.objects.output.geometries[0].properties.properties : {};
        missionCoordinates = data ? data.result.objects.output.geometries[0].coordinates : {};
        $( '#missionModalBody' ).load( '/events/mission.html');
        $('#missionModal').modal('show');
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
};

//Create a throttled version
var thGetMissions=_.throttle(getMissions, 300);

//attach handler to different map events
thGetMissions(null);
mainMap.on('moveend', function(){thGetMissions($('#missSearchTerm').val());});


$('#missSearchTerm').on('input',function(){
    thGetMissions(this.value);
});
