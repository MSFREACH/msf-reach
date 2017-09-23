$(function() {
  var id = window.location.search.split("=")[1];
  var contactInfo = {};
  var getContact = function() {
    $.getJSON("/api/contacts/" + id, function(contact) {
      contactInfo = contact.result ? contact.result.properties : {};
      _(contact.result.properties).forIn(function(value, key) {
        console.log("Key:", key, "Value", value);
        if (key === "nationality1" || key === "nationality2") {
          value = value.name;
        }
        $("span." + key).html(value);
      });
    });
  };

  getContact();
});
