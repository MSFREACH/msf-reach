To run
dev > `node app/build/dev-server.js` on port 8080
build > node build/build.js

also 'npm run start' on port 8001

*Note*: Vue Router is replacing server side routing in
    `app/src/router/index.js`

so `/` is now living at `/landing` route

all refactored ROUTES will have the prefix of [vv-] for consistency
