# NetFlux Specification 2.0

This is a specification, implementation and some testing code for NetFlux API 2.0.
in the `websocket` subdirectory is a websocket based implementation of the NetFlux API.
You can add another implementation of this API by creating a new directory like `websocket`
but it must have 2 files, `server.js` and `client.js`, `client.js` must be loadable using
require.js and server.js must be loadable using nodejs require.

This project contains a small demonstration and testing tool called chatflux. Any compliant
implementation of NetFlux should be able to be added and run chatflux with ONLY CHANGES MADE
TO `chatflux-demo/config.js`.

To run chatflux simply do the following:

```bash
cd chatflux-demo
npm install
bower install
node ./server.js
```

Then navigate your web browser to `http://[::1]:9000`.
