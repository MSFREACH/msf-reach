/**
 * Monitor status code to redirect login page if session expires.
*/
$(function() {
    $.ajaxSetup({
        statusCode: {
            401: function() {
                if (window.location.pathname !== '/login/') {
                    window.location.href = '/login/';
                }
            }
        }
    });
});
