// nav menu

var USERNAME = localStorage.getItem('username');

if (!USERNAME) {
  $('#username').append('SESSION');
} else {
  $('#username').append(USERNAME);
}

$('#logout').click(function() {
    Cookies.remove('jwt', {path: '/'} );
    localStorage.removeItem('username');
});
