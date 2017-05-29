cognicity_msf-server
====================
Data server for CogniCity MSF, built with NodeJS to provide JSON APIs to Postgres objects.

[![Build Status](https://travis-ci.org/usergroupcoop/cognicity_msf-server.svg?branch=master)](https://travis-ci.org/usergroupcoop/cognicity_msf-server)

### Dependencies
- see package.json, or run
```sh
$ npm install
```

### Build and Run
Code is written in ES2015 and compiled with babel to a dist folder.
```sh
$ npm run
```

### Testing
Integration tests run using unit.js and mocha. ESLint is used for formatting. For more information see doc/TESTING.md

To run tests, do:
```sh
$ npm test
```

### Data Formats
- GeoJSON
- TopoJSON


### Documentation
Further documentation can be found in the doc/, including:
- API.md - inforamtion on API
- TESTING.md - information on testing
