var doItOnce=true;

$('#permission').toggle(localStorage.getItem('username')!=null);
$('#sharepoint').toggle(localStorage.getItem('username')!=null);
$('#private').toggle(localStorage.getItem('username')!=null);

$(function () {
    var $sections = $('.form-section');

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
        $('.form-navigation .previous').toggle(index > 0 && index<($sections.length - 1));
        var atTheEnd = index >= $sections.length - 2;
        $('.form-navigation .next').toggle(!atTheEnd);
        $('.form-navigation [id=createContact]').toggle(index ==  $sections.length - 2 );
        if (index == MAPSECTIONINDEX && doItOnce)
        {
            newContactMap.invalidateSize();
            newContactMap.locate({setView: true, maxZoom: 16});
            doItOnce=false;
        }
    }

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
        if (cInd==STARTPAGEINDEX && localStorage.getItem('username')) {
            if (!$('#inputPermissionAcknowledge').is(':checked')) {
                alert('Please tick the acknowledgement box to continue.');
                return;
            }
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

            if (!valid_email($('#inputContactEmailRO').val()))
            {
                alert('Please enter a valid email address to proceed.');
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
          $('#checkEmailDiv').html('Verifying email ...')

          $.ajax({
              type: 'GET',
              url: '/api/contacts/peers',
              data: {
                email: $('#inputContactEmail').val()
              },
              contentType: 'application/json'
          }).done(function( data, textStatus, req ){
             console.log(data);
             $('.msf-contact-loader').hide();
             if (data.emailExists)
             {
               $('#checkEmailDiv').html('<p> This email already exists in the database. we have sent you an email with instructions on how to update or delete this contact.');
               $('.form-navigation .next').html('Try Again');
             }
               else{
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
