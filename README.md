msf-reach
================
Data server and web content for CogniCity MSF, built with NodeJS to provide JSON APIs to Postgres objects and accompanying web pages.

[![Build Status](https://travis-ci.org/usergroupcoop/cognicity_msf-server.svg?branch=master)](https://travis-ci.org/usergroupcoop/cognicity_msf-server)

[![Coverage Status](https://coveralls.io/repos/github/usergroupcoop/cognicity_msf-server/badge.svg?branch=master)](https://coveralls.io/github/usergroupcoop/cognicity_msf-server?branch=master)

### Dependencies
- see package.json, or run
```sh
$ npm install
```

### Environment variables
Set AWS_COGNITO_ALGORITHM to 'RS256', and AWS_COGNITO_PEM to the public key incl. line breaks—on AWS ElasticBeanstalk where line breaks are not supported in environment variables you need to replace new lines with commas when entering the environment variable, which will be converted back to line breaks in the code.

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
