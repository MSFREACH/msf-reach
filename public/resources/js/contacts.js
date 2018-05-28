/*eslint no-unused-vars: off*/

function openContactPopup(id)
{
    contactsLayer.eachLayer(function(layer){
        if (layer.feature.properties.id == id)
        {
            if (contactsClusters.hasLayer(layer))
                contactsClusters.zoomToShowLayer(layer);
            layer.openPopup(mainMap.center);
        }
    });
}



//Create a throttled version
var thGetContacts=_.throttle(getContacts, 300);

//attach handler to different map events
mainMap.on('load', function(){thGetContacts(null);});
mainMap.on('moveend', function(){thGetContacts($('#contSearchTerm').val());});


$('#contSearchTerm').on('input',function(){
    if ($('#inputContactType').val()!=='') {
        thGetContacts(this.value,$('#inputContactType').val());
    } else {
        thGetContacts(this.value);
    }

});

$('#inputContactType').on('change',function(){
    if ($('#contSearchTerm').val()!=='') {
        thGetContacts($('#contSearchTerm').val(),this.value);
    } else {
        thGetContacts(null,this.value);
    }
});
