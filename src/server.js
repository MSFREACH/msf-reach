import Promise from 'bluebird';

// Express middleware and http
import express from 'express';
import http from 'http';

// Import express middlewares
import expressSession from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import responseTime from 'response-time';
import morgan from 'morgan'; // Express logging
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { ensureAuthenticated } from './lib/util';

import nocache from 'nocache';

/** Function to initialize the api server config, db, logger
	* @class - Initialize server
	* @param {Object} config - server config
	* @param {Object} initializeDb - database initialization object
	* @param {Object} routes - API router object
	* @param {Object} logger - server logging object
	**/
const init = (config, initializeDb, routes, logger) => new Promise((resolve, reject) => {

    // Create the server
    let app = express();
    app.server = http.createServer(app);

    if (config.SESSION_SECRET) {
        app.use(expressSession({ secret: config.SESSION_SECRET, resave: true, saveUninitialized: false })); //Hopefully this fixes #236 //TODO Need to save sessions to db instead to avoid memory leaks in prod
    } else {
        app.use(expressSession({ resave: true, saveUninitialized: false }));
    }

    if(config.AZURE_AD_TENANT_NAME){
        // array to hold signed-in users
        let users = [];
        let findByOid = function(id, fn) {
            for (var i = 0, len = users.length; i < len; i++) {
                var user = users[i];
                if (user.oid === id) {
                    return fn(null, user);
                }
            }
            return fn(null, null);
        };
        const authenticationStrategy = new OIDCStrategy({
            identityMetadata: `https://login.microsoftonline.com/${config.AZURE_AD_TENANT_NAME}.onmicrosoft.com/.well-known/openid-configuration`,
            clientID: config.AZURE_AD_CLIENT_ID,
            redirectUrl: config.AZURE_AD_RETURN_URL,
            allowHttpForRedirectUrl: !config.REDIRECT_HTTP,
            responseType: 'id_token', //For openID Connect auth. See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-openid-connect-code
            responseMode: 'form_post', //This is recommended by MS
        },
        function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done){
            if (!profile.oid) {
                return done(new Error('No oid found'), null);
            }
            process.nextTick(function () {
                findByOid(profile.oid, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        // "Auto-registration"
                        var u = profile;
                        if(jwtClaims.groups){
                            if (jwtClaims.groups.indexOf(config.AZURE_AD_OPERATORS_GROUP_ID) > -1) {
                                u.groups = jwtClaims.groups; //Add groups from jwtclaims to our user GRP-APP-REACH-OPERATORS =
                            }
                            else {
                                return done(new Error('not in operators group'));
                            }
                        }
                        users.push(u);
                        return done(null, u);
                    }
                    return done(null, user);
                });
            });
        }
        );
        // const getAuthenticationStrategy = new OIDCStrategy({
        //     identityMetadata: `https://login.microsoftonline.com/${config.AZURE_AD_TENANT_NAME}.onmicrosoft.com/.well-known/openid-configuration`,
        //     clientID: config.AZURE_AD_CLIENT_ID,
        //     redirectUrl: config.AZURE_AD_RETURN_URL,
        //     allowHttpForRedirectUrl: !config.REDIRECT_HTTP,
        //     responseType: 'id_token', //For openID Connect auth. See: https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-protocols-openid-connect-code
        //     responseMode: 'form_post', //This is recommended by MS
        // },
        // function(iss, sub, profile, jwtClaims, access_token, refresh_token, params, done){
        //     if (!profile.oid) {
        //         return done(new Error('No oid found'), null);
        //     }
        //     process.nextTick(function () {
        //         findByOid(profile.oid, function(err, user) {
        //             if (err) {
        //                 return done(err);
        //             }
        //             if (!user) {
        //                 // "Auto-registration"
        //                 var u = profile;
        //                 if(jwtClaims.groups){
        //                     u.groups = jwtClaims.groups; //Add groups from jwtclaims to our user GRP-APP-REACH-OPERATORS =
        //                 } else {
        //                     return done(new Error('not in operators group'));
        //                 }
        //                 users.push(u);
        //                 return done(null, u);
        //             }
        //             return done(null, user);
        //         });
        //     });
        // }
        // );
        passport.serializeUser(function(user, done) {
            done(null, user.oid);
        });
        passport.deserializeUser(function(id, done) {
            findByOid(id, function (err, user) {
                done(err, user);
            });
        });

        // passport.use('local.one', authenticationStrategy);
        // passport.use('local.two', getAuthenticationStrategy);
        passport.use(authenticationStrategy);
        app.use(cookieParser()); //This must be used for passport-azure-ad
        app.use(bodyParser.urlencoded({ extended : true })); //This must be used for passport-azure-ad and come before app.use(passport.initialize());
        app.use(passport.initialize());
        app.use(passport.session());
    }

    // Parse body messages into json
    app.use(bodyParser.json({ limit: config.BODY_LIMIT }));

    // Winston stream function we can plug in to express so we can capture its logs along with our own
    const winstonStream = {
        write: function(message) {
            logger.info(message.slice(0, -1));
        }
    };

    // Setup express logger
    app.use(morgan('combined', { stream: winstonStream }));

    // Compress responses if required but only if caching is disabled
    if (config.COMPRESS && !config.CACHE) {
        app.use(compression());
    }

    if (!config.CACHE) {
        app.use(nocache());
    }

    // Provide CORS support (not required if behind API gateway)
    if (config.CORS) {
        app.use(cors({ exposedHeaders: config.CORS_HEADERS }));
    }

    // Provide response time header in response
    if (config.RESPONSE_TIME) {
        app.use(responseTime());
    }

    // Redirect http to https
    app.use(function redirectHTTP(req, res, next) {
        if (config.REDIRECT_HTTP && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        next();
    });

    // Try and connect to the db
    initializeDb(config, logger)
        .then((db) => {
            // Log debug message
            logger.debug('Successfully connected to DB');

            // Mount the routes
            if(config.AZURE_AD_TENANT_NAME){
                app.get('/login',
                    passport.authenticate('azuread-openidconnect', 'local.two', { failureRedirect: '/login'}),
                    function(req, res) {
                        res.redirect('/');
                    });
                app.post('/auth/openid/return',
                    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login'}),
                    function(req, res, next) { // eslint-disable-line no-unused-vars
                        //set a cookie here and then on the static page store it in localstorage
                        res.cookie('userdisplayName', req.user.displayName, { maxAge: 1000 * 60 * 1 }); //1 min cookie age should be enough
                        res.redirect('/authreturn');
                    });
                app.use('/authreturn', [ensureAuthenticated, express.static(config.STATIC_AUTH_RETURN_PATH)]);//Page used to store our user in localstorage and redirect to / after auth return from azure
            } else {
                app.use('/login', express.static(config.STATIC_AUTH_PATH));
            }
            app.use('/logout', function(req, res){ //Link in the navbar for logout links here when in Azure AD Auth Mode
                req.logout(); //works for jwtcheck and passport-azure-ad, removes user object from req
                if(!config.AUTH || config.AZURE_AD_TENANT_NAME){
                    res.send('Successfully logged out.');
                } else {
                    res.redirect('/login');
                }
            });

            //403 Error Handler
            // function handle403(err, req, res, next) {
            //     if (err.status !== 403) return next();
            //     res.write('<html>');
            //     res.write('<body>');
            //     res.write('<h1>403 Error</h1>');
            //     res.write('<h4>For edit access, please contact us: <a href="mailto:lucie.gueuning@hongkong.msf.org">Lucie Gueuning</a></h4>');
            //     res.write('</body>');
            //     res.write('</html>');
            //     res.end();
            // }
            // app.use(handle403);

            app.use('/report', express.static(config.STATIC_REPORT_PATH));
            app.use('/contact', express.static(config.STATIC_CONTACT_PATH));
            app.use('/lib', express.static(config.STATIC_LIB_PATH)); // Allow resources to be shared with un-authed path
            app.use('/resources', express.static(config.STATIC_RESOURCES_PATH)); // Allow resources to be shared with un-authed path

            // Mount the API. authentication specified within routes
            app.use('/api', routes({ config, db, logger }));
            app.use('/', [ensureAuthenticated, express.static(config.STATIC_PATH)]);

            // App is ready to go, resolve the promise
            resolve(app);

        })
        .catch((err) => {
            logger.error('DB Connection error: ' + err);
            logger.error('Fatal error: Application shutting down');

            // We cannot continue without a DB, reject
            reject(err);
        });
});

// Export the init function for use externally (e.g. in tests)
module.exports = { init };
