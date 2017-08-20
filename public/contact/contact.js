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
    $('.form-navigation [id=createContact]').toggle(index ==  $sections.length - 2 );
    if (index == 2 && doItOnce)
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
      if ((cInd==2)&&(!latlng))
       {
         alert("Please select a report location on the map to proceed.");
         return;
       }

      navigateTo(cInd + 1);
  });

  navigateTo(0); // Start at the beginning


 $('.form-navigation [id=createContact]').click(function(){
   navigateTo($sections.length - 1);
 })

});
