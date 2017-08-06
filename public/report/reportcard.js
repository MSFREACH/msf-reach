var doItOnce=true;
$(function () {
  var $sections = $('.form-section');

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
    $('.form-navigation [id=createReport]').toggle(index ==  $sections.length - 2 );
    if (index == 1 && doItOnce)
     {
       newReportMap.invalidateSize();
       newReportMap.locate({setView: true, maxZoom: 16});
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
      navigateTo(curIndex() + 1);
  });

  navigateTo(0); // Start at the beginning
  $('.rtype-item').on('click',function(){
    $(this).toggleClass('rtype-selected');
  });

  function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#imgPreview').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

$("#inputImageUpload").change(function(){
    readURL(this);
});

$('#btnUpTrigger').click(function(){
   $('#inputImageUpload').trigger('click');
 });

 $('.form-navigation [id=createReport]').click(function(){
   navigateTo($sections.length - 1);
 })

});
