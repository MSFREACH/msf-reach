// Globals
var tweetIdHTMLMap = {}; // Dictionary of tweetID + embedded tweet HTML markup

// Load Tweets to page
var loadTweets = function(err, tweets, next) {
    if (err){
        alert('Error loading tweets: '+ err);
    }
    else {
        if(!next){
            $('#tweetFeed').empty(); // here if same searchString then we just append
        }
        $.each(tweets, function(key, value){
            $('#tweetFeed').append('<div id="'+value.tweetId+'" draggable="true" ondragstart="drag(event)">'+value.tweetEmbed.html+'</div>');
            tweetIdHTMLMap[value.tweetId] = value.tweetEmbed.html;
        });


        twttr.widgets.load();

        // $('#tweets').scroll(checkScroll);

    }
};

var max_id = '';
// Perform GET call to get tweets
var getTweets = function(searchString, next) { // eslint-disable-line no-unused-vars
    var url = '/api/twitter/?searchString=' + searchString;
    if(next){
        url += ('&max_id=' + max_id);
        // console.log('get next batch -- max_id= ', max_id);
    }
    $.getJSON(url, function (data){
        max_id = data.lastId;
        loadTweets(null, data.result, next);
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            loadTweets(err.responseText, null);
        }
    });
};
