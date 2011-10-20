#!/bin/sh

# Requires uglifyjs

cat easyXDM/json2.min.js | uglifyjs > geoloqi-client.min.js
cat easyXDM/easyXDM.min.js | uglifyjs >> geoloqi-client.min.js
cat geoloqi-client.js | uglifyjs >> geoloqi-client.min.js
cat geoloqi-maps.js | uglifyjs >> geoloqi-client.min.js
cat geoloqi-sockets.js | uglifyjs >> geoloqi-client.min.js

