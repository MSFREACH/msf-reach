// Create map
var newContactMap = L.map('map').setView([-6.8, 108.7], 7);
newContactMap.locate({setView: true, maxZoom: 16});
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
}).addTo(newContactMap);

var baseMaps = {
	"Terrain": stamenTerrain,
	"Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'topright'}).addTo(newContactMap);

var marker;
var latlng = null;
newContactMap.on('click', function(e) {
	if(marker)
	newContactMap.removeLayer(marker);
	latlng = e.latlng; // e is an event object (MouseEvent in this case)
	marker = L.marker(e.latlng).addTo(newContactMap);
});

function postContact() {
	var contName=title+' '+ $("#inputContactFirstName").val()+' '+$("#inputContactLastName").val()+' '+$("#inputContactOtherName").val();
	var body = {
		"location":latlng,
		"properties":{
			"title": $("#inputContactTitle").val(),
			"gender": $("#inputGender").val(),
			"name": contName.trim(),
			"type":$("#inputContactAff").val() || $("#inputContactOtherAff").val() ,
			"cell":$("#inputContactCell").val() || '',
			"home":$("#inputContactHome").val() || '',
			"work":$("#inputContactWork").val() || '',
			"email":$("#inputContactEmail").val(),
			"email2": $("#inputContactEmail2").val() || '',
		}
	};
	//console.log(body);
	$.ajax({
		type: "POST",
		url: "/api/contacts",
		data: JSON.stringify(body),
		contentType: 'application/json'
	}).done(function( data, textStatus, req ){
		$('#divProgress').html('Contact submitted!');
		$('#divSuccess').show(500);
	}).fail(function (req, textStatus, err){
		$('#divProgress').html('An error occured');
		console.log(err);
		console.log(textStatus);
	});
}


$('#createContact').on('click', function (e) {
		$('#divProgress').html('Submitting new contact...');
		postContact();
});

$( function() {
	$( "#inputDOB" ).datepicker({
      changeMonth: true,
      changeYear: true
    });
});
