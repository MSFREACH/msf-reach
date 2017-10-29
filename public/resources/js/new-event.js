// Create map
var newEventMap = L.map('map').setView([-6.8, 108.7], 7);
var autocompleteMap=newEventMap;

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
}).addTo(newEventMap);

var baseMaps = {
	"Terrain": stamenTerrain,
	"Satellite" : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'bottomleft'}).addTo(newEventMap);

var marker;
var latlng = null;
newEventMap.on('click', function(e) {
	if(marker)
	newEventMap.removeLayer(marker);
	latlng = e.latlng; // e is an event object (MouseEvent in this case)
	marker = L.marker(e.latlng).addTo(newEventMap);
});
$(function(){
	$( "#inputEvDateTime" ).datepicker({
       changeMonth: true,
       changeYear: true,
 			dateFormat: 'yy-mm-dd',
 			yearRange: '1900:' + new Date().getFullYear()
     });


	$('#createEvent').on('click', function (e) {

		if (latlng === null){
			$('#newEventModalTitle').html('<h4>Missing event location</h4>');
			$('#newEventModalContent').html('<p>Please select the epicenter of the event using the map.</p>');
			$('#newEventModal').modal('toggle');
		}
		else {
			var sub_type = $("#inputDisasterType").val() || $("#inputDiseaseType").val()  || $("#inputOther").val();
			var body = {
				"status": "active",
				"type": $('#selectType').val(),
				"created": new Date().toISOString(),
				"location": latlng,
				"metadata":{
					"user": localStorage.getItem("username"),
					"name": (sub_type != '' ? sub_type : $('#selectType').val() ) + "_" + $("#inputEvDateTime").val(),
					"sub_type": sub_type,
					"event_datetime": $("#inputEvDateTime").val(),
					"event_status": $("#inputEvStatus").val(),
					"incharge_name": $("#inputInChargeName").val(),
					"incharge_position": $("#inputInChargePosition").val(),
					"severity":  $("#inputSeverity").val(),
					"sharepoint_link":  $("#inputSharepointLink").val(),
					"security_details": $("#inputSecurity").val(),
					/* Exploratory details: free text, ask user for
					* "Main results of the exploratory mission"
					*/
					"exploratory_details": $("#inputExploratoryDetails").val(),
					"operational_center": $("#inputOpCenter").val(), // check box with only one of OCA/OCBA/OBG/OCB/OCP ticked
					"other_orgs": $("#inputOtherOrgs").val(), // other organisations, free text
					"deployment": $("#inputDeployment").val(), // deployment details, free text
					"capacity": $("#inputCapacity").val(), // capacity, free text
					/* For next two items have asked for
					* Check Boxes + exact number of medical supply + date of arrival
					* but not listed anything, so leave as free text
					*/
					"medicalMaterials": $("#inputMedicalMaterials").val(),
					"nonMedicalMaterials": $("#inputNonMedicalMaterials").val(),
					"population_total": $("#inputPopulationTotal").val(), // total population in area affected
					"population_affected": $("#inputPopulationAffected").val() // population affected
					/* Note need to display % but we can
					* calcuate and display this on events page
					* from above two variables
					*/
				}
			};
      console.log(body);
			$.ajax({
				type: "POST",
				url: "/api/events",
				data: JSON.stringify(body),
				contentType: 'application/json'
			}).done(function( data, textStatus, req ){
				var eventId = data.result.objects.output.geometries[0].properties.id;
				window.location.href = '/events/?eventId='+eventId;
			}).fail(function (reqm, textStatus, err){
			if (reqm.responseText.includes('expired')) {
				alert("session expired");
			} else {
				$('#newEventModalTitle').html('<h4>Error creating event</h4>');
				$('#newEventModalContent').html('<p>' + err +'.</p>');
				$('#newEventModal').modal('toggle');
			}});
		}
	});

	$('#nextEventTab').on('click',function(){
		console.log('hi');
		$('#extraTab').tab('show');
	});


	$('#selectType').change(function(){
		$('#divNaturalDisaster').toggle(this.value == "natural_hazard");
		if (this.value != "natural_hazard")
		  $('#inputDisasterType').val('');

		$('#divDisease').toggle(this.value == "epidemiological");
		if (this.value != "epidemiological")
			$('#inputDiseaseType').val('');


		$('#divOther').toggle(this.value == "other");
		//$("#inputName").val(this.value.replace('_',' ')+" "+$("#inputEvDateTime").val());
	});


  $('#inputDisasterType , #inputDiseaseType').change(function(){
		$('#divOther').toggle(!this.value);
		if (this.value)
			$('#inputOther').val('');
	});


});
