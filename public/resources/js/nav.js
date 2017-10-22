var USERNAME = localStorage.getItem("username");

$('#username').append(USERNAME);

$('#logout').click(function() {
  Cookies.remove('jwt', {path: '/'} );
  localStorage.removeItem("username");
});

var handleUnAuthorized= function (errorObject)
{
  if (errorObject.responseJSON.status == 401)
   {
     alert("It seems you have been logged out of the system. You will be redirected to login page.");
     location.href="/";
   }
}
