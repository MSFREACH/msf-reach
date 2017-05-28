CogniCity MSF Server
====================

### Integration Testing
Testing runs against a live instance of the API server, connected to a local instance of cognicity_msf-schema database. Testing checks whether the server will initialize and then tests specific properties of the API endpoints (e.g. get events).

### Travis CI
Travis runs the integration testing as specified in .travis.yml. Note:
- Travis can only currently test schema against Postgresql 9.4 (schema built with 9.6)
- Script is hard coded to use master branch of schema, and so won't test other branches
