/*eslint no-unused-vars: off*/


/**
* Function to allow drag and drop of tweets
* @function allowDropEv
* @param {Object} ev - drop event
**/
function allowDrop(ev) {
    ev.preventDefault();
}

/**
* Function to call on drag, sets transfer data to tweet ID
* @function drag
* @param {Object} ev - drag event
**/
function drag(ev) {
    var tweetDivId = ev.srcElement.id;
    if (ev.srcElement.id.split('-')[0] === 'twitter'){
        tweetDivId = ($('#'+ev.srcElement.id).parent()[0].id);
    }
    ev.dataTransfer.setData('tweetDivId', tweetDivId);
}

/**
* Function to call on drop of tweet, saves it for the REACH event
* @function dropSaveTweet
* @param {Object} ev - drop (UI) event
**/
function dropSaveTweet(ev) {
    ev.preventDefault();
    var tweetDivId = ev.dataTransfer.getData('tweetDivId');
    var tweetEventReportLink = eventReportLink.replace('&', '%26');
    $('#savedTweets').prepend(document.getElementById(tweetDivId));
    $('#'+tweetDivId).append('<a class="btn btn-primary" href="https://twitter.com/intent/tweet?in_reply_to='+tweetDivId+'&text=Please+send+further+information+'+tweetEventReportLink+'">Reply</a><hr>');


    if (currentEventProperties.metadata.saved_tweets){
        // add tweet to the existing list of saved tweets
        currentEventProperties.metadata.saved_tweets.push({'tweetId':tweetDivId, 'html':tweetIdHTMLMap[tweetDivId]});
    }
    else {
        // start a new list of saved tweets
        currentEventProperties.metadata.saved_tweets = [{'tweetId':tweetDivId, 'html':tweetIdHTMLMap[tweetDivId]}];
    }

    // fill in PUT body
    var body = {
        'status':'active',
        'type': currentEventProperties.type,
        'metadata':{'saved_tweets':currentEventProperties.metadata.saved_tweets}
    };

    // now save it for the event
    $.ajax({
        type: 'PUT',
        url: '/api/events/' + currentEventProperties.id,
        data: JSON.stringify(body),
        contentType: 'application/json'
    }).done(function( data, textStatus, req ){
        // console.log('save tweet on server');
    }).fail(function(err) {
        if (err.responseText.includes('expired')) {
            alert('session expired');
        } else {
            alert('error: '+ err.responseText);
        }
    });
}

/**
* Function to call on drop remove of tweet
* @function dropRemoveTweet
* @param {Object} ev - drop (UI) event
**/
function dropRemoveTweet(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var tweet = ev.dataTransfer.getData('tweet');

    ev.target.appendChild(document.getElementById(data));
}

$(window).on('load', function(){
    $('.li').css({'border':'1px solid red'});
});
