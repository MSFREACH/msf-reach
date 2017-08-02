var loadTweets = function(err, tweets){
  if (err){
    alert('Error loading tweets: '+ err)
  }
  else {
    $('#tweetFeed').empty();
    $.each(tweets, function(key, value){
      $('#tweetFeed').append('<div id="'+value.tweetId+'" draggable="true" ondragstart="drag(event)">'+value.tweetEmbed.html+'</div>');
    })
    twttr.widgets.load()
  }
}

var getTweets = function(searchString){
  console.log(searchString);
  $.getJSON('/api/twitter/?searchString=' + searchString, function (data){
    loadTweets(null, data.result);
  }).fail(function(err){
    loadTweets(err.responseText, null);
  })
}

$('#btnSearchTwitter').click(function(e){
  if ($('#searchTerm').val() !== ""){
    var search = $('#searchTerm').val()

    getTweets(search);

  }
});
