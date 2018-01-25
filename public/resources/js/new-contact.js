/*eslint no-unused-vars: off*/

// eslint-disable-next-line no-useless-escape
var mail_regex = /(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/;

// Create map
var newContactMap = L.map('map').setView([20, 110], 4);
var autocompleteMap=newContactMap;

newContactMap.locate({setView: true, maxZoom: 16});
// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
}).addTo(newContactMap);

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

var baseMaps = {
    'Terrain': mapboxTerrain,
    'Satellite' : mapboxSatellite
};

var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'topright'}).addTo(newContactMap);

var marker;
var latlng = null;
newContactMap.on('click', function(e) {
    if(marker)
        newContactMap.removeLayer(marker);
    latlng = e.latlng; // e is an event object (MouseEvent in this case)
    marker = L.marker(e.latlng).addTo(newContactMap);
});

function valid_email(email) {
    return mail_regex.test(email);
}

function postContact() {
    var contName=($('#inputContactFirstName').val() || '')+' '+($('#inputContactLastName').val() || '')+' '+($('#inputContactOtherName').val() || '');

    var body = {
        'location':latlng,
        'properties':{
            'address': $('#mapAddress').val(),
            'title': $('#inputContactTitle').val() || $('#inputContactOtherTitle').val(),
            'otherNames': $('#inputContactOtherName') || '',
            'gender': $('#inputGender').val() || $('#inputContactOtherGender').val(),
            'name': contName.trim(),
            'speciality': $('#inputSpeciality').val() || '',
            'type':$('#inputContactAff').val() || $('#inputContactOtherAff').val(),
            'division': $('#inputContactAffDivision').val() || '',
            'dob':$('#datepicker').val(),
            'web': $('#inputContactWeb').val() || '',
            'email':$('#inputContactEmail').val(),
            'email2': $('#inputContactEmail2').val() || '',
            'WhatsApp': $('#inputWhatsApp').val() || '',
            'Facebook': $('#inputFacebook').val() || '',
            'Twitter': $('#inputTwitter').val() || '',
            'Instagram': $('#inputInstagram').val() || '',
            'Telegram': $('#inputTelegram').val() || '',
            'Skype': $('#inputSkype').val() || '',
        }
    };

    if ($('#inputContactCell').val()) {
        body.properties['cell']=$('#inputContactCell').intlTelInput('getNumber');
    }
    if ($('#inputContactHome').val()) {
        body.properties['home']=$('#inputContactHome').intlTelInput('getNumber');
    }
    if ($('#inputContactWork').val()) {
        body.properties['work']=$('#inputContactWork').intlTelInput('getNumber');
    }
    if ($('#inputContactCell').val()) {
        body.properties['fax']=$('#inputContactFax').intlTelInput('getNumber');
    }

    if ($('#inputContactAff').val() === 'Current MSF Staff') {
        body.properties['affiliationName'] = 'MSF';
        body.properties['OC'] = $('#inputContactOC').val();
        body.properties['msf_employment'] = $('#inputContactMSFEmploy').val();
        body.properties['msf_section'] = $('#inputMSFSection').val() || '';
        body.properties['msf_branch'] = $('#inputMSFBranch').val() || '';
        body.properties['msf_project'] = $('#inputMSFProject').val() || '';
        body.properties['msf_missions'] = $('#inputMSFMissions').val() || '';
    } else if ($('#inputContactAff').val() !== '') {
        body.properties['affiliationName'] = $('#inputContactAff').val();
    } else {
        body.properties['affiliationName'] = $('#inputAffName').val() || '';
    }

    $.ajax({
        type: 'POST',
        url: '/api/contacts',
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
        $('#divProgress').html('Contact submitted!');
        $('#divSuccess').show(500);
    }).fail(function (req, textStatus, err){
        $('#divProgress').html('An error ' + err + 'occured');
    });
}

$( function() {
    $( '#datepicker' ).datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd/mm/yy',
        yearRange: '1900:' + new Date().getFullYear(),
        onSelect: function(dateText, inst) {
            $('#datepicker').text(dateText);
        }
    });
});

$('#createContact').on('click', function (e) {
    $('#divProgress').html('Submitting new contact...');
    postContact();
});

$('#inputContactCell').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactWork').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactHome').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactFax').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});
