var doItOnce=true;
var updateMode=false;
var qGUID=null;
var qEmail=null;


$(function () {
    qGUID=getQueryVariable('token');
    qEmail=getQueryVariable('email');
    $('#permission').toggle(localStorage.getItem('username')!=null && !qGUID);
    $('#sharepoint').toggle(localStorage.getItem('username')!=null);
    $('#private').toggle(localStorage.getItem('username')!=null && !qGUID);

    const STARTPAGEINDEX = 0;
    const CHECKEMAILPAGEINDEX =1;
    const NAMESECTIONINDEX = 2;
    const MAPSECTIONINDEX = 4;
    const CONTACTDETAILSINDEX =5;

    function navigateTo(index) {
    // Mark the current section with the class 'current'
        $sections
            .removeClass('current')
            .eq(index)
            .addClass('current');
        // Show only the navigation buttons that make sense for the current section:
        $('.form-navigation .previous').toggle(index > (updateMode ? NAMESECTIONINDEX : 0) && index<($sections.length - 1));
        var atTheEnd = index >= $sections.length - 2;
        $('.form-navigation .next').toggle(!atTheEnd);
        $('.form-navigation [id=createContact]').toggle((!updateMode)&&(index ==  $sections.length - 2) );
        $('.form-navigation [id=updateContact]').toggle((updateMode)&&(index ==  $sections.length - 2) );
        if (index == MAPSECTIONINDEX && doItOnce)
        {
            newContactMap.invalidateSize();
            if (newContactMap.msf_latlng)
                newContactMap.setView(newContactMap.msf_latlng,17);
            else
                newContactMap.locate({setView: true, maxZoom: 17});
            doItOnce=false;
        }
    }


    if (qGUID && qEmail)
    {
        updateMode=true;
        $('#updateModal').modal('show');
        $('#updateModalMsg').html('Loading contact data ...');
        $('#updateModalBody .msf-contact-loader').show();
        $('#btnDeleteContact').on('click',function(){
            if (confirm('Are you sure you want to remove your contact details? This cannot be undone.'))
            {
                $.ajax({
                    type: 'DELETE',
                    url: '/api/contacts/peers?email='+qEmail+'&guid='+qGUID,
                    data: {},
                    contentType: 'application/json'
                }).done(function( resp, textStatus, req ){ // eslint-disable-line no-unused-vars
                    //console.log(resp);
                    if (resp.statusCode==200)
                    {
                        alert('Contact successfully removed');
                        location.href='/contact/';

                    }
                }).fail(function (req, textStatus, err){ // eslint-disable-line no-unused-vars
                    $('#updateModalMsg').html('Error in deleting contact, contact <a href="mailto:admin@msf-reach.org">MSF admin</a> for manual deletion.');

                });

            }
        });
        $.ajax({
            type: 'GET',
            url: '/api/contacts/peers/byemail',
            data: { guid: qGUID,
                email: qEmail },
            contentType: 'application/json'
        }).done(function( resp, textStatus, req ){ // eslint-disable-line no-unused-vars
            $('#updateModalBody .msf-contact-loader').hide();
            $('#updateModalMsg').html('Your contact details have been successfully retrieved.');
            //console.log(resp);
            //'location':newContactMap.msf_latlng,
            newContactMap.setView([resp.result.lat, resp.result.lng],17);
            newContactMap.msf_latlng = {lat: resp.result.lat, lng: resp.result.lng};
            newContactMap.msf_marker = L.marker({lat: resp.result.lat, lng: resp.result.lng}).addTo(newContactMap);
            var props=resp.result.properties;
            $('#mapAddress').val(props.address);
            $('#inputContactTitle').val(props.title); //'title':  || $('#inputContactOtherTitle').val(),
            $('#inputContactOtherName').val(props.otherNames);
            if ((props.gender=='male')||(props.gender=='female'))
                $('#inputGender').val(props.gender);
            else {
                $('#inputGender option:last').attr('selected',true);
                $('#inputContactOtherGender').val(props.gender);
            }

            $('#inputContactType').val(props.type);
            $('#divOtherType').toggle(props.type == 'Other');
            $('#divNonMSFFields').toggle(props.type != 'Current MSF Staff');
            $('#divMSFFields').toggle(props.type == 'Current MSF Staff');
            if (props.type === 'Current MSF Staff') {
                $('#inputContactOC').val(props.OC);
                $('#inputContactMSFEmploy').val(props.msf_employment);
                $('#inputMSFSection').val(props.msf_section);
                $('#inputMSFBranch').val(props.msf_branch);
                $('#inputMSFProject').val(props.msf_project);
                $('#inputMSFMission').val(props.msf_mission);
            } else {
                $('#inputContactMSFAssociate').prop('checked', props.msf_associate);
                $('#inputContactMSFPeer').prop('checked', props.msf_peer);
                $('#inputContactEmployerName').val(props.employer);
                $('#inputContactJobTitle').val(props.job_title);
                $('#inputContactEmployerDivision').val(props.division);
            }
            $('#inputContactCell').intlTelInput('setNumber', props.cell);
            $('#inputContactWork').intlTelInput('setNumber', props.work);
            $('#inputContactHome').intlTelInput('setNumber', props.home);
            $('#inputContactFax').intlTelInput('setNumber', props.fax);

            //'gender': $('#inputGender').val() || $('#inputContactOtherGender').val(),
            //var contName=($('#inputContactFirstName').val() || '')+' '+($('#inputContactLastName').val() || '')+' '+($('#inputContactOtherName').val() || '');
            $('#inputContactFirstName').val(props.name.split(' ')[0]);
            $('#inputContactLastName').val(props.name.split(' ')[1]);
            $('#inputSpeciality').val(props.speciality);

            //'type': $('#inputContactTypeOther').val() || $('#inputContactType').val() || '',
            $('#datepicker').val(props.dob);
            $('#inputContactWeb').val(props.web) ;
            //'email':$('#inputContactEmail').val(),
            $('#inputContactEmailRO').attr('readonly',false);
            $('#inputContactEmailRO').val(props.email);
            $('#inputContactEmail2').val(props.email2);
            $('#inputContactSharepoint').val(props.sharepoint);
            $('#inputWhatsApp').val(props.WhatsApp);
            $('#inputFacebook').val(props.Facebook);
            $('#inputTwitter').val(props.Twitter);
            $('#inputInstagram').val(props.Instagram);
            $('#inputTelegram').val(props.Telegram);
            $('#inputSkype').val(props.Skype);
            navigateTo(NAMESECTIONINDEX);

        }).fail(function (req, textStatus, err){
            $('#updateModalBody .msf-contact-loader').hide();
            $('#updateModalMsg').html('An error, ' + err + ', occured');
        });

    }



    var $sections = $('.form-section');

    function curIndex() {
    // Return the current index by looking at which section has the class 'current'
        return $sections.index($sections.filter('.current'));
    }

    // Previous button is easy, just go back
    $('.form-navigation .previous').click(function() {
        navigateTo(curIndex() - 1);
    });

    // Next button goes forward iff current block validates
    $('.form-navigation .next').on('click',function() {
        var cInd=curIndex();
        if (cInd==NAMESECTIONINDEX) {
            if (!$('#inputContactFirstName').val() || !$('#inputContactLastName').val()) {
                alert('Please enter your name to continue');
                return;
            }
        }
        if (cInd==STARTPAGEINDEX && localStorage.getItem('username') && !qGUID) {
            if (!$('#inputPermissionAcknowledge').is(':checked')) {
                alert('Please tick the acknowledgement box to continue.');
                return;
            }
        }
        if (cInd==STARTPAGEINDEX && qGUID) {
            navigateTo(NAMESECTIONINDEX);
        }

        if (cInd==MAPSECTIONINDEX)
        {
            if (!newContactMap.msf_latlng)
            {
                alert('Please enter an address/location to proceed.');
                return;
            }
            if ((!$('#mapAddress').val()) && (!(confirm('You have not entered a street address; would you like to proceed anyway ? '))))
                return;
        }
        else if (cInd == CONTACTDETAILSINDEX)
        {
            if ($('#inputContactCell').val() && !$('#inputContactCell').intlTelInput('isValidNumber'))
            {
                alert('Please enter a valid cell phone number to proceed.');
                return;
            }
            if ($('#inputContactHome').val() && !$('#inputContactHome').intlTelInput('isValidNumber'))
            {
                alert('Please enter a valid home phone number to proceed.');
                return;
            }
            if ($('#inputContactWork').val() && !$('#inputContactWork').intlTelInput('isValidNumber'))
            {
                alert('Please enter a valid work phone number to proceed.');
                return;
            }
            if ($('#inputContactFax').val() && !$('#inputContactFax').intlTelInput('isValidNumber'))
            {
                alert('Please enter a valid fax number to proceed.');
                return;
            }

            if ($('#inputContactEmail2').val() && !valid_email($('#inputContactEmail2').val())) {
                alert('Please enter a valid second email address to proceed.');
                return;
            }
        }

        if (cInd==CHECKEMAILPAGEINDEX)
        {
            if (!valid_email($('#inputContactEmail').val()))
            {
                alert('Please enter a valid email address to proceed.');
                return;
            }
            $('.msf-contact-loader').show();
            $('#checkEmailDiv').html('Verifying email ...');

            $.ajax({
                type: 'GET',
                url: '/api/contacts/peers',
                data: {
                    email: $('#inputContactEmail').val()
                },
                contentType: 'application/json'
            }).done(function( data, textStatus, req ){ // eslint-disable-line no-unused-vars
                //console.log(data);
                $('.msf-contact-loader').hide();
                if (data.emailExists)
                {
                    $('#checkEmailDiv').html('<p> This email already exists in the database. we have sent you an email with instructions on how to update or delete this contact.');
                    $('.form-navigation .next').html('Please check your email.');
                }
                else{
                    $('#checkEmailDiv').html('Email checked.');
                    $('#inputContactEmailRO').val($('#inputContactEmail').val());
                    $('.form-navigation .next').html('Next');
                    navigateTo(cInd + 1);
                }

            }).fail(function (req, textStatus, err){
                $('.msf-contact-loader').hide();
                $('#checkEmailDiv').html('An error ' + err + 'occured');
            });
        }
        else{
            navigateTo(cInd + 1);
        }
    });

    navigateTo(0); // Start at the beginning


    $('.form-navigation [id=createContact]').click(function(){
        navigateTo($sections.length - 1);
    });

    $('.form-navigation [id=updateContact]').click(function(){
        navigateTo($sections.length - 1);
    });

    $('#inputContactTitle').change(function(){
        $('#divOtherTitle').toggle(!this.value);
    });

    $('#inputGender').change(function(){
        $('#divOtherGender').toggle(!this.value);
    });


    $('#inputContactType').change(function() {
        $('#divOtherType').toggle(this.value == 'Other');
        $('#divNonMSFFields').toggle(this.value != 'Current MSF Staff');
        $('#divMSFFields').toggle(this.value == 'Current MSF Staff');
    });

});
