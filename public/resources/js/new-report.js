// Create map
var newReportMap = L.map('map').setView([-6.8, 108.7], 7);
newReportMap.locate({setView: true, maxZoom: 16});
// Add some base tiles
var stamenTerrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
  attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
}).addTo(newReportMap);

var baseMaps = {
  "Terrain": stamenTerrain,
  "Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(newReportMap);

var marker;
var latlng = null;
newReportMap.on('click', function(e) {
    if(marker)
        newReportMap.removeLayer(marker);
    latlng = e.latlng; // e is an event object (MouseEvent in this case)
    marker = L.marker(e.latlng).addTo(newReportMap);
});

$('#createReport').on('click', function (e) {
		var eventId = getQueryVariable("eventId");
		var reportKey = getQueryVariable("reportkey");
		var reportTags=[];
		$('.rtype-selected').each(function() {
			reportTags.push(this.getAttribute('data-msf-value'));
		});

    if (latlng === null){
			//$('#newEventModalTitle').html('<h4>Missing event location</h4>');
			//$('#newEventModalContent').html('<p>Please select the epicenter of the event using the map.</p>')
			//$('#newEventModal').modal('toggle');
			console.log('new location supplied')
    }
    else {
      var body = {
				"eventId": eventId,
				"status": "confirmed",
				"created": new Date().toISOString(),
				"reportkey": reportKey,
				"location":latlng,
				"content":{
					"report_tags": JSON.stringify(reportTags),
					"username/alias":$("#inputReportUserName").val(),
					"description":$("#inputReportText").val(),
					"image_link": "",
				}
			}
      //console.log(body);
      $.ajax({
        type: "POST",
        url: "/api/reports",
        data: JSON.stringify(body),
        contentType: 'application/json'
      }).done(function( data, textStatus, req ){
				alert('Report submitted');
      }).fail(function (req, textStatus, err){
				console.log(err);
				console.log(textStatus);
      });
    }
})
