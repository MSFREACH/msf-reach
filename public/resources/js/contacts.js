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
        "<tr><td><a href='#' onclick='onContactLinkClick(" +
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

var onContactLinkClick = function(id) {
  window.open('/contact/details?id=' + id, "popupWindow", "width=600,height=640,scrollbars=auto");
};

// Perform GET call to get tweets
var getContacts = function(term){
  //$('#contactsContainer').html('<i class="glyphicon glyphicon-refresh gly-spin"></i>Loading contacts...')
  let url='/api/contacts?geoformat=geojson' +(term ? ('&search='+term) :'')
  $.getJSON(url, function (data){
    loadContacts(null, data.result.features);
  }).fail(function(err){
    loadContacts(err.responseText, null);
  });
};

getContacts(null);


$('#contSearchTerm').on('input',function(){
  var throttFunc=_.throttle(getContacts, 300);
  throttFunc(this.value);
});
