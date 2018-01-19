/*eslint no-unused-vars: off*/

function openContactPopup(id)
{
    contactsLayer.eachLayer(function(layer){
        if (layer.feature.properties.id == id)
        {
            if (contactsClusters.hasLayer(layer))
                contactsClusters.zoomToShowLayer(layer);
            layer.openPopup(eventsMap.center);
        }
    });
}

// Load Contacts to contacts table tab
var loadContacts = function(err, contacts) {
    if (err) {
        alert('Error loading contacts: ' + err);
    } else {
        $('#contactsContainer').html(
            '<table class="table table-hover" id="contactsTable"><thead><tr><th>&nbsp;</th><th>Name</th><th>Email</th><th>Mobile</th><th>Affiliation</th><th>Speciality</th></tr></thead><tbody>'
        );

        $.each(contacts, function(key, value) {

            var speciality = '';
            if (typeof(value.properties.properties.type) !== 'undefined' && value.properties.properties.type.toUpperCase().includes('MSF')) {

                speciality = (typeof(value.properties.properties.speciality) === 'undefined'
                    ? ''
                    : value.properties.properties.speciality);

            }


            // console.log(key, value);
            $('#contactsTable').append(
                '<tr id=\'crow'+value.properties.id+'\' class=\'cursorPointer\' onclick=\'openContactPopup('+value.properties.id+')\'><td><a data-toggle=\'modal\' data-target=\'#contactDetailsModal\' href=\'#\' onclick=\'onContactLinkClick(' +
          value.properties.id +
          ')\' class=\'contact-link btn btn-sm btn-primary\' title=\'Quick View\'><i class=\'glyphicon glyphicon-eye-open\'></i></a></td><td>' +
          (typeof value.properties.properties.title === 'undefined'
              ? ''
              : value.properties.properties.title) +
          ' ' +
          value.properties.properties.name +
          '</td><td class="emailcell">' +
          (typeof value.properties.properties.email === 'undefined'
              ? ''
              : '<a href="mailto:' +
              value.properties.properties.email +
              '">' +
              value.properties.properties.email +
              '</a>') +
          '</td><td>' +
          (typeof value.properties.properties.cell === 'undefined'
              ? ''
              : value.properties.properties.cell) +
          '</td><td>' +
          (typeof value.properties.properties.type === 'undefined'
              ? ''
              : value.properties.properties.type) +
          '</td><td>' + speciality +

          '</td></tr>'
            );
        });

        $('#contactsTable').append('</tbody></table>');
    }
};

// Perform GET call to get contacts
var getContacts = function(term){
    var url='/api/contacts?geoformat=geojson' +(term ? ('&search='+term) :'');
    var lngmin= eventsMap.getBounds().getSouthWest().wrap().lng;
    var latmin= eventsMap.getBounds().getSouthWest().wrap().lat;
    var lngmax= eventsMap.getBounds().getNorthEast().wrap().lng;
    var latmax= eventsMap.getBounds().getNorthEast().wrap().lat;
    url=url+'&lngmin='+lngmin+'&latmin='+latmin+'&lngmax='+lngmax+'&latmax='+latmax;
    $.getJSON(url, function (data){
        loadContacts(null, data.result.features);
        //remap contacts
        mapContacts(data.result);
        contactsLayer.eachLayer(function(layer){
            layer.on('mouseover',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('mouseout',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
            layer.on('touchstart',function(e){$('#crow'+layer.feature.properties.id).addClass('isHovered');});
            layer.on('touchend',function(e){$('#crow'+layer.feature.properties.id).removeClass('isHovered');});
        });

    }).fail(function(err){
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            // Catch condition where no data returned
            loadContacts(err.responseText, null);
        }
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
