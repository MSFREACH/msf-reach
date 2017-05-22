cognicity_msf-server
====================

Data server for CogniCity MSF, built with NodeJS to provide JSON APIs to Postgres objects.

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
- currently on ESLint
- *TODO* Add unit tests

### Data Formats
- GeoJSON
- TopoJSON

### API Endpoints
|Request Type|Endpoint|Action|
|------------|--------|------|
|GET|/events/|Returns list of events|
|GET|/events/:id/|Returns event as specified by id|
