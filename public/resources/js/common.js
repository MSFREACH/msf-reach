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

var severityLabels = ['<span style="color:green">low</span>',
                      '<span style="color:orange">medium</span>',
                      '<span style="color:red">high</span>'];
