var doItOnce=true;
$(function () {
    var $sections = $('.form-section');
    var NAMESECTIONINDEX = 1;
    var MAPSECTIONINDEX = 3;
    var CONTACTDETAILSINDEX =4;
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
        if (cInd==MAPSECTIONINDEX)
        {
            if (!latlng)
            {
                alert('Please enter an address/location to proceed.');
                return;
            }
            if ((!$('#mapAddress').val()) && (!(confirm('You have not entered a street address; would you like to proceed anyway ? '))))
                return;
        }
        else if (cInd == CONTACTDETAILSINDEX)
        {
            if ((!$('#inputContactCell').val()) && (!$('#inputContactWork').val()) && (!$('#inputContactHome').val()) )
            {
                alert('Please enter a phone number to proceed.');
                return;
            }
            if ((!$('#inputContactEmail').val())&&(!$('#inputContactEmail2').val()) )
            {
                alert('Please enter an email address to proceed.');
                return;
            }
        }

        navigateTo(cInd + 1);
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

    $('#inputContactAff').change(function(){
        $('#divOtherAff').toggle(!this.value);
        $('#divMSFFields').toggle(this.value == 'Current MSF Staff');
        $('#divAffName').toggle(this.value != 'Current MSF Staff');
    });

});
