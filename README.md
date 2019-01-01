msf-reach
================
Data server and web content for CogniCity MSF, built with NodeJS to provide JSON APIs to Postgres objects and accompanying web pages.

[![Build Status](https://travis-ci.org/MSFREACH/msf-reach.svg?branch=master)](https://travis-ci.org/MSFREACH/msf-reach)

[![Coverage Status](https://coveralls.io/repos/github/MSFREACH/msf-reach/badge.svg?branch=master)](https://coveralls.io/github/MSFREACH/msf-reach?branch=master)

### Dependencies
- see package.json, or run
```sh
$ npm install
```

### Local environment
For running locally, make sure you have a .env file with any overrides for src/config.js, and also update [public/resources/js/events.js#L9](https://github.com/MSFREACH/msf-reach/blob/master/public/resources/js/events.js#L9) to your localhost (and port number as per config). Use of cognito for authentication is disabled by default to make local testing easier (but enabled for our hosted environment).

### Environment variables
#### Login
If using Cognito: Set AWS_COGNITO_ALGORITHM to 'RS256', and AWS_COGNITO_PEM to the public key incl. line breaks—on AWS ElasticBeanstalk where line breaks are not supported in environment variables you need to replace new lines with commas when entering the environment variable, which will be converted back to line breaks in the code.

If using Active Directory: Set the AZURE_AD_* variables with values supplied by AD operator.

Either way, set AUTH=true to force users to login (otherwise if false it will bypass login for local test and development)

#### Other environment variables:
* ARCGIS_TOKEN: obtain from https://arcgis.cartong.org/arcgis/tokens/generateToken by using username, password, setting expiry for one year, and referrer https://(environment.)msf-reach.org/
* APP_NAME: leave this as default 'msf-reach'. Only used for logging.
* API_KEY: set this to a randomly generated string and then also set for chatbot to make its calls.
* VIZALYTICS_API_KEY: as provided by Vizalytics
* AWS_S3_REGION: s3 region for upload files bucket
* AWS_S3_BUCKETNAME: bucket name for upload files bucket
* BODY_LIMIT: defaults to 100kb for upload post/put body data (but not file uploads)
* CACHE: true / false to use an internal http cache
* COMPRESS: true / false for gzip compression
* CORS: leave this one out to default to true for CORS headers (required for https and neither here nor there for http)
* CORS_HEADERS: actual CORS headers (leave this one out to use default)
* DEFAULT_EVENT_SEARCH_DISTANCE: distance in m (default 1000000m) to look for events to check for duplicates on entry
* GOOGLE_API_KEY: set to server side Google API key for geocoding etc.
* PG*: Postgres connection details
* LOG*: Logging options. Best to leave this out to use defaults.
* PORT: TCP port to run on (omit to use default of 8001 for Elastic Beanstalk)
* BASE_URL: base URL eg. https://msf-reach.org/ , if ommited defaults to 'http://localhost:8001/',
* REDIRECT_HTTP: if running behind https proxy / load balancer, redirect http -> https for incoming requests to load balancer / proxy.
* SESSION_SECRET: set this to a random string.
* SMTP_USER/PASS: AWS SES SMTP credentials.
* TWILIO_AUTH_TOKEN: auth token for twilio for sms webhook (in testing)
* TWITTER_*: twitter app credentials.

### Build and Run
Code is written in ES2015 and compiled with babel to a dist folder. To build and run locally:
```sh
npm run start
```
To build for deployment:
```sh
npm run build
```

### Database
The database schema can be found in [msf-reach-schema](https://github.com/MSFREACH/msf-reach-schema).

### Testing
Integration tests run using unit.js and mocha. ESLint is used for formatting. For more information see doc/TESTING.md

To run tests, do:
```sh
$ npm test
```

Testing is run on [travis-ci.org](https://travis-ci.org/MSFREACH/msf-reach).

### Data Formats
- GeoJSON
- TopoJSON


### Documentation
Further documentation can be found in doc/ including:
- API.md - information on API
- TESTING.md - information on testing
