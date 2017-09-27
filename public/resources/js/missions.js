// Load Missions to missions table tab
var loadMissions = function(err, missions) {
  if (err) {
    alert("Error loading missions: " + err);
  } else {
    $("#missionsContainer").html(
      '<table class="table table-striped" id="missionsTable"><thead><tr><th>&nbsp;</th><th>Name</th><th>Region</th><th>Start</th><th>End</th><th>Severity</th><th>Capacity</th></tr></thead><tbody>'
    );

    $.each(missions, function(key, value) {
      $("#missionsTable").append(
        "<tr><td><a data-toggle='modal' data-target='#missionModal' href='#' onclick='onMissionLinkClick(" +
          value.properties.id +
          ")' class='contact-link btn btn-sm btn-primary' title='Quick View'><i class='glyphicon glyphicon-eye-open'></i></a></td><td>" +
          value.properties.properties.name +
          "</td><td>" +
          value.properties.properties.region +
          "</td><td>" +
          value.properties.properties.startDate +
          "</td><td>" +
          value.properties.properties.finishDate +
          "</td><td>" +
          value.properties.properties.severity +
          "</td><td>" +
          value.properties.properties.capacity +
          "</td></tr>"
      );
    });

    $("#missionsTable").append("</tbody></table>");
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

var missionData = {};
var onMissionLinkClick = function(id) {
  async.waterfall([
    function(callback) {
      // Load Mission Details template to BT Modal 1st
      $( "#missionModalBody" ).load( "/resources/tpl/missions/details.html" );
      callback();
    },
    function(callback) {
      $.getJSON("/api/missions/" + id, function(data) {
        missionData = data.result ? data.result.properties : {};
        _(missionData).forIn(function(value, key) {
          console.log("Key:", key, "Value:", value);
          // if (key === "nationality1" || key === "nationality2") {
          //   value = value.name;
          // }
          $("span.event-" + key).html(value);
        });
        callback();
      });      
    }
  ]);
};
