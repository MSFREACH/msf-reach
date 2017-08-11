// Load Missions to missions table tab
var loadMissions = function(err, missions){
  if (err){
    alert('Error loading missions: '+ err)
  }
  else {

    $('#missionsContainer').append('<table class="table table-striped" id="missionsTable"><thead><tr><th>Name</th><th>Region</th></tr></thead><tbody>');

    $.each(missions, function(key, value){
      $('#missionsTable').append('<tr><td>'+value.properties.properties.name+'</td><td>'+value.properties.region+'</td></tr>');
    })

    $('#missionsTable').append('</tbody></table>');
  }
}

// Perform GET call to get tweets
var getMissions = function(){
  $.getJSON('/api/missions', function (data){
    loadMissions(null, data.results.features);
  }).fail(function(err){
    loadMissions(err.responseText, null);
  })
}

getMissions();
