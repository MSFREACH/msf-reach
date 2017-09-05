// Load Contacts to contacts table tab
var loadContacts = function(err, contacts){
  if (err){
    alert('Error loading contacts: '+ err);
  }
  else {

    $('#contactsContainer').append('<table class="table table-striped" id="contactsTable"><thead><tr><th>Name</th><th>Email</th><th>Cell</th><th>Org</th><th>D.O.B.</th><th>Nationality 1</th><th>Nationality 2</th><th>WhatsApp</th><th>Twitter</th><th>Facebook</th></tr></thead><tbody>');

    $.each(contacts, function(key, value) {
      //console.log(key, value);
      $('#contactsTable').append('<tr><td>'+(typeof(value.properties.properties.title)==='undefined' ? '' : value.properties.properties.title) + ' ' + value.properties.properties.name +
        '</td><td>'+(typeof(value.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+value.properties.properties.email+'">'+value.properties.properties.email+'</a>') +
        '</td><td>'+(typeof(value.properties.properties.cell)==='undefined' ? '' : value.properties.properties.cell) +
        '</td><td>'+(typeof(value.properties.properties.type)==='undefined' ? '' : value.properties.properties.type) +
        '</td><td>'+(typeof(value.properties.properties.speciality)==='undefined' ? '' : value.properties.properties.speciality) +
        '</td></tr>');
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
