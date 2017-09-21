// Load Contacts to contacts table tab
var loadContacts = function(err, contacts){
  if (err){
    alert('Error loading contacts: '+ err);
  }
  else {

    $('#contactsContainer').html('<table class="table table-striped" id="contactsTable"><thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Speciality</th></tr></thead><tbody>');

    $.each(contacts, function(key, value) {
      //console.log(key, value);
      $('#contactsTable').append('<tr><td>'+(typeof(value.properties.properties.title)==='undefined' ? '' : value.properties.properties.title) + ' ' + value.properties.properties.name +
        '</td><td class="emailcell">'+(typeof(value.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+value.properties.properties.email+'">'+value.properties.properties.email+'</a>') +
        '</td><td>'+(typeof(value.properties.properties.cell)==='undefined' ? '' : value.properties.properties.cell) +
        '</td><td>'+(typeof(value.properties.properties.speciality)==='undefined' ? '' : value.properties.properties.speciality) +
        '</td></tr>');
    });

    $('#contactsTable').append('</tbody></table>');
  }
};

// Perform GET call to get tweets
var getContacts = function(term){
  $('#contactsContainer').html('<i class="glyphicon glyphicon-refresh gly-spin"></i>Loading contacts...')
  let url='/api/contacts?geoformat=geojson' +(term ? ('&search='+term) :'')
  $.getJSON(url, function (data){
    loadContacts(null, data.result.features);
  }).fail(function(err){
    loadContacts(err.responseText, null);
  });
};

getContacts(null);

$('#contSearchTerm').on('input',function(){
  getContacts(this.value);
});
