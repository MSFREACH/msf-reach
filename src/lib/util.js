// Import dependencies
import Promise from 'bluebird';
import jwt from 'express-jwt';
// import jwks from 'jwks-rsa'; // See TODO below regarding Auth0 mechanism
import dbgeo from 'dbgeo';

// Import config
import config from '../config';

// Caching
import apicache from 'apicache';
apicache.options({ debug: config.LOG_LEVEL === 'debug', statusCodes: { include: [200] } })
let cache = apicache.middleware;

// Cache response if enabled
const cacheResponse = (duration) => cache(duration, config.CACHE);

// Configure our JWT checker
const jwtCheck = jwt({
  secret: new Buffer(config.AUTH0_SECRET),
  audience: config.AUTH0_CLIENT_ID
});
// TODO: Move to single auth0 mechanism once they support SPA auth using API
/*const jwtCheck = jwt({
  credentialsRequired: config.SECURE_AUTH0,
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${config.AUTH0_ISSUER}/.well-known/jwks.json`
  }),
  audience: config.AUTH0_AUDIENCE,
  issuer: config.AUTH0_ISSUER,
  algorithms: ['RS256']
});*/

// Setup dbgeo
dbgeo.defaults = {
  outputFormat: config.GEO_FORMAT_DEFAULT,
  geometryColumn: 'the_geom',
  geometryType: 'wkb',
  precision: config.GEO_PRECISION
}

// Format the geographic response with the required geo format
const formatGeo = (body, outputFormat) => new Promise((resolve, reject) => {
  // Check that body is an array, required by dbgeo.parse
  if (Object.prototype.toString.call( body ) !== '[object Array]'){
    body = [body]; // Force to array
  }
	dbgeo.parse(body, { outputFormat }, (err, formatted) => {
		if (err) reject(err);
		resolve(formatted);
	})
})

// Handle a geo response, send back a correctly formatted json object with
// status 200 or not found 404, catch and forward any errors in the process
const handleGeoResponse = (data, req, res, next) => {
  return !data ?
    res.status(404).json({ statusCode: 404, found: false, result: null }) :
      formatGeo(data, req.query.geoformat)
        .then((formatted) => res.status(200).json({ statusCode: 200, result: formatted }))
        .catch((err) => next(err))
}

// Handle a regular response, send back result or 404
const handleResponse = (data, req, res) => {
  return !data ?
    res.status(404).json({ statusCode: 404, found: false, result: null }) :
    res.status(200).json({ statusCode: 200, result: data })
}

module.exports = {
  cacheResponse, formatGeo, handleResponse, handleGeoResponse, jwtCheck
}
