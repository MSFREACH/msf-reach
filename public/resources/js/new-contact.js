/*eslint no-unused-vars: off*/

// mail regex generated from https://github.com/AcrossTheCloud/Mail-RFC822-Address
// eslint-disable-next-line no-useless-escape
var mail_regex = /(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\037\177]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[(?:[^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/;

// Create map
var newContactMap = L.map('map').setView([20, 110], 4);
var autocompleteMap=newContactMap;

//newContactMap.locate({setView: true, maxZoom: 16});
// Add some base tiles
var mapboxTerrain = L.tileLayer('https://api.mapbox.com/styles/v1/msfhk/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXNmaGsiLCJhIjoiY2pxdnp0N3E2MTBwZDQybWhtMGw2aWljYSJ9.I6nmYZcm6p77JgxlITRfpQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
    minZoom: 0,
    maxZoom: 18
}).addTo(newContactMap);

// Add some satellite tiles
var mapboxSatellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXNmaGsiLCJhIjoiY2pxdnp0N3E2MTBwZDQybWhtMGw2aWljYSJ9.I6nmYZcm6p77JgxlITRfpQ', {
    attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
});

// OSM HOT tiles
var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
});

// base maps
var baseMaps = {
    'Terrain': mapboxTerrain,
    'Satellite' : mapboxSatellite,
    'Humanitarian': OpenStreetMap_HOT
};


// set up overlay maps and control
var overlayMaps = {};

var layerControl = L.control.layers(baseMaps, overlayMaps, {'position':'topright'}).addTo(newContactMap);

if (L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(layerControl._container)
        .disableScrollPropagation(layerControl._container);
} else {
    L.DomEvent.disableClickPropagation(layerControl._container);
}

newContactMap.on('click', function(e) {
    if(this.msf_marker)
        newContactMap.removeLayer(this.msf_marker);
    this.msf_latlng = e.latlng; // e is an event object (MouseEvent in this case)
    this.msf_marker = L.marker(e.latlng).addTo(newContactMap);
});

/** check if an email is valid, using above monster regex
* @function valid_email
* @param {string} email - email address to validate (returns true if valid)
*/
function valid_email(email) {
    return mail_regex.test(email);
}

/** post contact Information
* @function postContact
*/
function postContact() {
    var contName=($('#inputContactFirstName').val() || '')+' '+($('#inputContactLastName').val() || '')+' '+($('#inputContactOtherName').val() || '');

    var body = {
        'location':newContactMap.msf_latlng,
        'properties':{
            'address': $('#mapAddress').val(),
            'title': $('#inputContactTitle').val() || $('#inputContactOtherTitle').val(),
            'otherNames': $('#inputContactOtherName').val() || '',
            // 'gender': $('#inputGender').val() || $('#inputContactOtherGender').val(),
            'name': contName.trim(),
            // 'speciality': $('#inputSpeciality').val() || '',
            'type': $('#inputContactTypeOther').val() || $('#inputContactType').val() || '',
            // 'dob':$('#datepicker').val(),
            // 'web': $('#inputContactWeb').val() || '',
            'email':$('#inputContactEmailRO').val(),
            'email2': $('#inputContactEmail2').val() || '',
            'sharepoint': $('#inputContactSharepoint').val() || '',
            'WhatsApp': $('#inputWhatsApp').val() || '',
            'Facebook': $('#inputFacebook').val() || '',
            'Twitter': $('#inputTwitter').val() || '',
            'Instagram': $('#inputInstagram').val() || '',
            'Telegram': $('#inputTelegram').val() || '',
            'Skype': $('#inputSkype').val() || '',
        }
    };

    if (localStorage.getItem('oid')) {
        body['oid'] = localStorage.getItem('oid');
    }
    if (localStorage.getItem('username')!=null) {
        body.properties['msf_entered'] = true;
        if ($('#inputPrivate').is(':checked')) {
            body['private'] = true;
        } else {
            body['private'] = false;
        }
    } else {
        body.properties['msf_entered'] = false;
        body['private'] = false;
    }

    if ($('#inputContactCell').val()) {
        body.properties['cell']=$('#inputContactCell').intlTelInput('getNumber');
    } else {
        body.properties['cell'] = '';
    }
    if ($('#inputContactHome').val()) {
        body.properties['home']=$('#inputContactHome').intlTelInput('getNumber');
    }
    else {
        body.properties['home'] = '';
    }
    if ($('#inputContactWork').val()) {
        body.properties['work']=$('#inputContactWork').intlTelInput('getNumber');
    } else {
        body.properties['work'] = '';
    }
    // if ($('#inputContactFax').val()) {
    //     body.properties['fax']=$('#inputContactFax').intlTelInput('getNumber');
    // } else {
    //     body.properties['fax'] = '';
    // }

    if ($('#inputContactType').val() === 'Current MSF Staff') {
        body.properties['OC'] = $('#inputContactOC').val();
        body.properties['msf_employment'] = $('#inputContactMSFEmploy').val();
        body.properties['msf_additional'] = $('#inputMSFAdditional').val() || '';
        body.properties['job_title'] = $('#inputContactJobTitle').val() || '';
        // body.properties['msf_section'] = $('#inputMSFSection').val() || '';
        // body.properties['msf_branch'] = $('#inputMSFBranch').val() || '';
        // body.properties['msf_project'] = $('#inputMSFProject').val() || '';
        // body.properties['msf_mission'] = $('#inputMSFMission').val() || '';
    } else {
        body.properties['msf_associate'] = $('#inputContactMSFAssociate').is(':checked');
        body.properties['msf_peer'] = $('#inputContactMSFPeer').is(':checked');
        body.properties['employer'] = $('#inputContactEmployerName').val() || '';
        body.properties['job_title'] = $('#inputContactJobTitle').val() || '';
        body.properties['division'] = $('#inputContactEmployerDivision').val() || '';
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

/** update contact Information
* @function patchContact
*/
function patchContact() {
    var contName=($('#inputContactFirstName').val() || '')+' '+($('#inputContactLastName').val() || '')+' '+($('#inputContactOtherName').val() || '');

    var body = {
        'location':newContactMap.msf_latlng,
        'properties':{
            'address': $('#mapAddress').val(),
            'title': $('#inputContactTitle').val() || $('#inputContactOtherTitle').val(),
            'otherNames': $('#inputContactOtherName').val() || '',
            // 'gender': $('#inputGender').val() || $('#inputContactOtherGender').val(),
            'name': contName.trim(),
            // 'speciality': $('#inputSpeciality').val() || '',
            'type': $('#inputContactTypeOther').val() || $('#inputContactType').val() || '',
            // 'dob':$('#datepicker').val(),
            // 'web': $('#inputContactWeb').val() || '',
            'email':$('#inputContactEmailRO').val(),
            'email2': $('#inputContactEmail2').val() || '',
            'sharepoint': $('#inputContactSharepoint').val() || '',
            'WhatsApp': $('#inputWhatsApp').val() || '',
            'Facebook': $('#inputFacebook').val() || '',
            'Twitter': $('#inputTwitter').val() || '',
            'Instagram': $('#inputInstagram').val() || '',
            'Telegram': $('#inputTelegram').val() || '',
            'Skype': $('#inputSkype').val() || '',
        }
    };

    /* wont need this for update

    if (localStorage.getItem('oid')) {
        body['oid'] = localStorage.getItem('oid');
    }

    if (localStorage.getItem('username')!=null) {
        body.properties['msf_entered'] = true;
        if ($('#inputPrivate').is(':checked')) {
            body['private'] = true;
        } else {
            body['private'] = false;
        }
    } else {
        body.properties['msf_entered'] = false;
        body['private'] = false;
    }
    */

    if ($('#inputContactCell').val()) {
        body.properties['cell']=$('#inputContactCell').intlTelInput('getNumber');
    } else {
        body.properties['cell'] = '';
    }
    if ($('#inputContactHome').val()) {
        body.properties['home']=$('#inputContactHome').intlTelInput('getNumber');
    }
    else {
        body.properties['home'] = '';
    }
    if ($('#inputContactWork').val()) {
        body.properties['work']=$('#inputContactWork').intlTelInput('getNumber');
    } else {
        body.properties['work'] = '';
    }
    // if ($('#inputContactFax').val()) {
    //     body.properties['fax']=$('#inputContactFax').intlTelInput('getNumber');
    // } else {
    //     body.properties['fax'] = '';
    // }

    if ($('#inputContactType').val() === 'Current MSF Staff') {
        body.properties['OC'] = $('#inputContactOC').val();
        body.properties['msf_employment'] = $('#inputContactMSFEmploy').val();
        body.properties['msf_additional'] = $('#inputMSFAdditional').val();
        // body.properties['msf_section'] = $('#inputMSFSection').val() || '';
        // body.properties['msf_branch'] = $('#inputMSFBranch').val() || '';
        // body.properties['msf_project'] = $('#inputMSFProject').val() || '';
        // body.properties['msf_mission'] = $('#inputMSFMission').val() || '';
    } else {
        body.properties['msf_associate'] = $('#inputContactMSFAssociate').is(':checked');
        body.properties['msf_peer'] = $('#inputContactMSFPeer').is(':checked');
        body.properties['employer'] = $('#inputContactEmployerName').val() || '';
        body.properties['job_title'] = $('#inputContactJobTitle').val() || '';
        body.properties['division'] = $('#inputContactEmployerDivision').val() || '';
    }

    var patchUrl='/api/contacts/peers?email='+qEmail+'&guid='+qGUID;
    if (updateOperatorMode)
        patchUrl='/api/contacts/'+qContactId;


    $.ajax({
        type: 'PATCH',
        url: patchUrl,
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
        $('#divProgress').html('Contact updated!');
        $('#divSuccess').show(500);
    }).fail(function (req, textStatus, err){
        $('#divProgress').html('An error ' + err + 'occured');
    });
}

$( function() {
    // add date picker element
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

// Submitting message on contact creation
$('#createContact').on('click', function (e) {
    $('#divProgress').html('Submitting new contact...');
    postContact();
});

//Updaing contact
$('#updateContact').on('click', function (e) {
    $('#divProgress').html('Updating contact...');
    patchContact();
});

// Set up phone elements (incl. validation)
$('#inputContactCell').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactWork').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactHome').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});

$('#inputContactFax').intlTelInput({utilsScript: '/lib/intlTelUtils.js'});
