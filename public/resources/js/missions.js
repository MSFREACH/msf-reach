// Load Missions to missions table tab
var loadMissions = function(err, missions) {
  if (err){
    alert('Error loading missions: '+ err);
  }
  else {

    $('#missionsContainer').html('<table class="table table-striped" id="missionsTable"><thead><tr><th>Name</th><th>Region</th><th>Start</th><th>End</th><th>Severity</th><th>Capacity</th></tr></thead><tbody>');

    $.each(missions, function(key, value) {
      $('#missionsTable').append('<tr><td>'+value.properties.properties.name+'</td><td>'+value.properties.properties.region+'</td><td>'+value.properties.properties.startDate+'</td><td>'+value.properties.properties.finishDate+'</td><td>'+value.properties.properties.severity+'</td><td>'+value.properties.properties.capacity+'</td></tr>');
    });

    $('#missionsTable').append('</tbody></table>');
  }
};

// Perform GET call to get Missions
var getMissions = function(term) {
  $.getJSON(
    "/api/missions?geoformat=geojson" + (term ? "&search=" + term : ""),
    function(data) {
      loadMissions(null, data.result.features);
    }
  ).fail(function(err) {
    loadMissions(err.responseText, null);
  });
};

getMissions(null);

$("#messSearchTerm").on("input", function() {
  var throttFunc=_.throttle(getMissions, 300);
  throttFunc(this.value);
});
