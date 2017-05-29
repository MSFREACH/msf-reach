CogniCity MSF Server - Testing
==============================

### Integration Testing
Testing runs against a live instance of the API server, connected to a local instance of cognicity_msf-schema database. Testing checks whether the server will initialise and then tests specific properties of the API endpoints (e.g. get events). Local variables initialised within the test harness are used to share returned values between http calls. Default configuration values in config.js are used to testing.

### Travis CI
Travis runs the integration testing as specified in .travis.yml. Note:
- ~~Travis can only currently test schema against Postgresql 9.4 (schema built with 9.6)~~
  - Updated 2017-05-29 - changed to use Travis VM with Postgres 9.5 (see https://docs.travis-ci.com/user/database-setup/#PostgreSQL)
  - This may cause problems if json functionality from 9.6 required in future changes
- Script is hard coded to use master branch of schema, and so won't test other branches
