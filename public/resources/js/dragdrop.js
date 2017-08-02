function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    var tweetDivId = ev.srcElement.id;
    if (ev.srcElement.id.split('-')[0] === 'twitter'){
      tweetDivId = ($('#'+ev.srcElement.id).parent()[0].id);
    }
    ev.dataTransfer.setData("tweetDivId", tweetDivId);
}

function dropSaveTweet(ev) {
    ev.preventDefault();
    var tweetDivId = ev.dataTransfer.getData("tweetDivId");
    console.log(eventReportLink);
    var tweetEventReportLink = eventReportLink.replace("&", "%26")
    console.log('make put request for save tweet:'+tweetDivId);
    $('#savedTweets').prepend(document.getElementById(tweetDivId));
    $('#'+tweetDivId).append('<a class="btn btn-primary" href="https://twitter.com/intent/tweet?in_reply_to='+tweetDivId+'&text=Please+send+further+information+'+tweetEventReportLink+'">Reply</a><hr>');

  }

function dropRemoveTweet(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var tweet = ev.dataTransfer.getData("tweet");

    console.log('make put request for save tweet: '+tweet);
    ev.target.appendChild(document.getElementById(data));
}

$(window).on("load", function(){
  $('.li').css({'border':'1px solid red'});
})
