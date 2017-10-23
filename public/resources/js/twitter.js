// Globals
var tweetIdHTMLMap = {}; // Dictionary of tweetID + embedded tweet HTML markup

// Load Tweets to page
var loadTweets = function(err, tweets) {
  if (err){
    alert('Error loading tweets: '+ err);
  }
  else {
    $('#tweetFeed').empty();
    $.each(tweets, function(key, value){
      $('#tweetFeed').append('<div id="'+value.tweetId+'" draggable="true" ondragstart="drag(event)">'+value.tweetEmbed.html+'</div>');
      tweetIdHTMLMap[value.tweetId] = value.tweetEmbed.html;
    });
    twttr.widgets.load();
  }
};

// Perform GET call to get tweets
var getTweets = function(searchString) {
  console.log(searchString);
  $.getJSON('/api/twitter/?searchString=' + searchString, function (data){
    loadTweets(null, data.result);
  }).fail(function(err) {
    if (err.responseText.includes('expired')) {
      alert("session expired");
    } else {
      loadTweets(err.responseText, null);
    }
  });
};

// Search Twitter
$('#btnSearchTwitter').click(function(e){
  if ($('#searchTerm').val() !== "") {
    var search = $('#searchTerm').val();
    getTweets(search);

  }
});
