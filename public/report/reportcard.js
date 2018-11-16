var doItOnce=true;
var navigateTo;//exporting the function
$(function () {

    if (window.location.hash) {
        $('#noEventName').hide();
        $('#withEventName').html('MSF would like to request any information you may have about the ' + decodeURIComponent(window.location.hash.substring(1).replace(/\+/g, ' ')) + ' event that may be happening in your area.');
        $('#withEventName').show();
    }

    var $sections = $('.form-section');

    navigateTo= function(index) {
    // Mark the current section with the class 'current'
        $sections
            .removeClass('current')
            .eq(index)
            .addClass('current');
        // Show only the navigation buttons that make sense for the current section:
        $('.form-navigation .previous').toggle(index > 0 && index<($sections.length - 1));
        var atTheEnd = index >= $sections.length - 2;
        $('.form-navigation .next').toggle(!atTheEnd);
        $('.form-navigation [id=createReport]').toggle(index ==  $sections.length - 2 );
        if (index == 1 && doItOnce)
        {
            newReportMap.invalidateSize();
            newReportMap.locate({setView: true, maxZoom: 16});
            doItOnce=false;
        }
    };

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
        if(cInd == 0 &&  (window.location.href.includes('/report') && !$('#inputGDPRAcknowledge').is(':checked'))) {
            alert('Please tick the Information consent box to continue.');
            return;
        }
        if ((cInd==1)&& typeof($('.rtype-selected').attr('data-msf-value'))==='undefined') {
            alert('Please select a report type');
            return;
        }
        if ((cInd==1)&& $('.rtype-selected').attr('data-msf-value')==='CONTACTS') {
            window.location.href = window.location.href.replace(/report.*/gi,'contact/');
        }
        if ((cInd==2)&&(!newReportMap.msf_latlng))
        {
            alert('Please select a report location on the map to proceed.');
            return;
        }
        if ((cInd==3)&& $('#inputReportText').val()==='') {
            alert('Please enter report details');
            return;
        }
        navigateTo(cInd + 1);
    });

    navigateTo(0); // Start at the beginning
    $('.rtype-item').on('click',function(){
        $('.rtype-item').removeClass('rtype-selected');
        $(this).toggleClass('rtype-selected');
    });

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {

                $('#btnUpTrigger').hide();
                $('#imgPreview').show();
                $('#imgPreview').attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        }
    }

    $('#inputImageUpload').change(function(){
        readURL(this);
    });

    $('#btnUpTrigger').click(function(){
        $('#inputImageUpload').trigger('click');
    });

    $('.form-navigation [id=createReport]').click(function(){
        navigateTo($sections.length - 1);
    });

});

var cleanupForNewReport = function (){ // eslint-disable-line no-unused-vars
    // tidy up
    $('#inputReportText').val('');
    $('#inputReportUserName').val('');
    $('#mapAddress').val('');
    $('#imgPreview').hide();
    $('#imgPreview').attr('src','');
    if (marker) {
        newReportMap.removeLayer(marker);
    }
    if (newReportMap.msf_latlng) {
        newReportMap.msf_latlng = null;
    }
    $('.form-section').removeClass('current');
    $('.rtype-item').removeClass('rtype-selected');
    $('#divProgress').html('');
    $('#divSuccess').hide();
    $('#inputImageUpload').val('');
    doItOnce=true;
    navigateTo(0);



};
