// Load Contacts to contacts table tab
var loadContacts = function(err, contacts) {
  if (err) {
    alert("Error loading contacts: " + err);
  } else {
    $("#contactsContainer").html(
      '<table class="table table-striped" id="contactsTable"><thead><tr><th>&nbsp;</th><th>Name</th><th>Email</th><th>Mobile</th><th>Speciality</th></tr></thead><tbody>'
    );

    $.each(contacts, function(key, value) {
      // console.log(key, value);
      $("#contactsTable").append(
        "<tr><td><a data-toggle='modal' data-target='#contactDetailsModal' href='#' onclick='onContactLinkClick(" +
          value.properties.id +
          ")' class='contact-link btn btn-sm btn-primary' title='Quick View'><i class='glyphicon glyphicon-eye-open'></i></a></td><td>" +
          (typeof value.properties.properties.title === "undefined"
            ? ""
            : value.properties.properties.title) +
          " " +
          value.properties.properties.name +
          '</td><td class="emailcell">' +
          (typeof value.properties.properties.email === "undefined"
            ? ""
            : '<a href="mailto:' +
              value.properties.properties.email +
              '">' +
              value.properties.properties.email +
              "</a>") +
          "</td><td>" +
          (typeof value.properties.properties.cell === "undefined"
            ? ""
            : value.properties.properties.cell) +
          "</td><td>" +
          (typeof value.properties.properties.speciality === "undefined"
            ? ""
            : value.properties.properties.speciality) +
          "</td></tr>"
      );
    });

    $("#contactsTable").append("</tbody></table>");
  }
};

var normalizeLng=function(lng){
  if (lng>180)
   return 180;
  else if (lng<-180)
   return -180;
  else
    return lng;
}

// Perform GET call to get tweets
var getContacts = function(term){
  var url='/api/contacts?geoformat=geojson' +(term ? ('&search='+term) :'')
  var lngmin= normalizeLng(eventsMap.getBounds().getSouthWest().lng);
  var latmin= eventsMap.getBounds().getSouthWest().lat;
  var lngmax= normalizeLng(eventsMap.getBounds().getNorthEast().lng);
  var latmax= eventsMap.getBounds().getNorthEast().lat;
  url=url+'&lngmin='+lngmin+'&latmin='+latmin+'&lngmax='+lngmax+'&latmax='+latmax;
  $.getJSON(url, function (data){
    loadContacts(null, data.result.features);
    //remap contacts
    mapContacts(data.result);
  }).fail(function(err){
    loadContacts(err.responseText, null);
  });
};

//Create a throttled version
var thGetContacts=_.throttle(getContacts, 300);

//attach handler to different map events
eventsMap.on('load', function(){thGetContacts(null);});
eventsMap.on('moveend', function(){thGetContacts($('#contSearchTerm').val());});


$('#contSearchTerm').on('input',function(){
  thGetContacts(this.value);
});
