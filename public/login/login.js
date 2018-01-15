// Get JWT from AWS Cognito based on username and password
console.log('Authenticaiton script running');

// Constants
var POOL_DATA = {
    UserPoolId : 'ap-southeast-2_izc55nNFX', // Your user pool id here
    ClientId : 'uke84ie7fl3aj9djnpqufoam' // Your client id here
};

var setJWTCookie = function(jwt){
    Cookies.set('jwt', jwt);
    $.ajax({
        url: '/',
        type: 'GET',
        beforeSend: function(xhr){
            xhr.setRequestHeader('Authorization', 'Bearer ' + jwt);
        },
        error: function(err){
            console.log(err);
        },
        success: function(){
            var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(POOL_DATA);
            var cognitoUser = userPool.getCurrentUser();
            localStorage.setItem('username', JSON.stringify(cognitoUser.username).replace(/\"/g, ''));
            window.location.replace('/');
        }
    });
};

var authSuccess = function(result){
    var token = result.getAccessToken().getJwtToken();
    console.log('succesfully authenticated with AWS');
    setJWTCookie(token);
};

var cognitoAuth = function(){
    console.log('running here');
    var authenticationData = {
        Username : $('#inputEmail').val(),
        Password : $('#inputPassword').val(),
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(POOL_DATA);
    var userData = {
        Username : $('#inputEmail').val(),
        Pool : userPool
    };
    var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: authSuccess,
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            $('#form-signin').hide();
            $('#form-password-reset').toggle();
            var self = this;
            console.log('New password required');
            // the api doesn't accept this field back
            delete userAttributes.email_verified;
            $('#btn-confirm-reset-password').on('click', function(){
                cognitoUser.completeNewPasswordChallenge($('#input-new-password').val(), userAttributes, {
                    onSuccess: function(result){
                        alert('Please login with new password');
                        window.location.replace('/login');
                    },
                    onFailure: function(error){
                        alert(error.message);
                    }
                });
            });
        },

        onFailure: function(err) {
            console.log('err: '+ err);
            alert(err);
            $('#login').html('LOGIN').attr('disabled',false);
        },
    });
};

$('#login').click(function(){
    $('#login').html('Authenticating....').attr('disabled',true);
    setTimeout(cognitoAuth,2);//force UI update before authenticating
});

$('#inputPassword').keyup(function(event){
    if(event.keyCode == 13){
        $('#login').click();
    }
});
