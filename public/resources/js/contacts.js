// Load Contacts to contacts table tab
var loadContacts = function(err, contacts){
  if (err){
    alert('Error loading contacts: '+ err);
  }
  else {

    $('#contactsContainer').append('<table class="table table-striped" id="contactsTable"><thead><tr><th>Name</th><th>D.O.B.</th><th>Nationality 1</th><th>Nationality 2</th><th>Org</th><th>Email</th><th>Cell</th><th>WhatsApp</th><th>Twitter</th><th>Facebook</th></tr></thead><tbody>');

    $.each(contacts, function(key, value) {
      //console.log(key, value);
      $('#contactsTable').append('<tr><td>'+value.properties.properties.title + ' ' + value.properties.properties.name
        +'</td><td>'+value.properties.properties.dob || ''
        +'</td><td>'+value.properties.properties.nationality1.name || ''
        +'</td><td>'+value.properties.properties.nationality2.name || ''
        +'</td><td>'+value.properties.properties.dob || ''
        +'</td><td>'+value.properties.properties.type || ''
        +'</td><td>'+value.properties.properties.email || ''
        +'</td><td>'+value.properties.properties.cell || ''
        +'</td><td>'+value.properties.properties.WhatsApp || ''
        +'</td><td>'+value.properties.properties.Twitter || ''
        +'</td><td>'+value.properties.properties.Facebook || ''
        +'</td></tr>');
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
