// Load Contacts to contacts table tab
var loadContacts = function(err, contacts){
  if (err){
    alert('Error loading contacts: '+ err);
  }
  else {

    $('#contactsContainer').append('<table class="table table-striped" id="contactsTable"><thead><tr><th>Name</th><th>Org</th><th>Email</th><th>Cell</th></tr></thead><tbody>');

    $.each(contacts, function(key, value) {
      //console.log(key, value);
      $('#contactsTable').append('<tr><td>'+value.properties.properties.name+'</td><td>'+value.properties.properties.type+'</td><td>'+value.properties.properties.email+'</td><td>'+value.properties.properties.cell+'</td></tr>');
    });

    $('#contactsTable').append('</tbody></table>');
  }
};

// Perform GET call to get tweets
var getContacts = function(){
  $.getJSON('/api/contacts?geoformat=geojson', function (data){
    loadContacts(null, data.result.features);
  }).fail(function(err){
    loadContacts(err.responseText, null);
  });
};

getContacts();
