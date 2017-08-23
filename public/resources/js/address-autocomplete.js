

function initGoogle()
{

  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('mapAddress'),{
    types: ['geocode'],
    //setting preference to NSW bounds:
    //bounds: (new google.maps.LatLngBounds({lat: -35.816081, lng:141.035681 },{lat:-28.108865 , lng:153.560095 }))
  });
  //autocomplete.setComponentRestrictions({'country': ['au']});
   // Bind the map's bounds (viewport) property to the autocomplete object,
   // so that the autocomplete requests use the current map bounds for the
   // bounds option in the request.
   //autocomplete.bindTo('bounds', map);

   autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      alert("No details available for input: '" + place.name + "'. Please select from one of the suggested addresses.");
      return;
    }

    var foundLatLng=place.geometry.location.toJSON();

    var addrDetailLevel=place.address_components.length;
    console.log(addrDetailLevel);
    newEventMap.setView([foundLatLng.lat, foundLatLng.lng],(addrDetailLevel > 3) ? 17 : 7);
    //newEventMap.setView([-25.274398, 133.775136 ], 7);




  });
}
