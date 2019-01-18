
let [id, email] = window.location.hash.substring(1).split('+');


$.ajax({
    type: 'POST',
    url: '/api/events/unsubscribeEmailLink/' + id,
    data: JSON.stringify({ 'email': email}),
    contentType: 'application/json'
}).done(function() {
    $('#confirmationDiv').append('unsubscribed');
}).fail(function(err) {
    ('#confirmationDiv').append('unsubscribe failed' + err + ' please contact <a href="mailto:admin.reach@hongkong.msf.org">MSF REACH</a> with details of the error');
});
