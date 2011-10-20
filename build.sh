#!/bin/sh
# Requires uglifyjs

cat source/easyXDM/json2.min.js | uglifyjs > geoloqi.min.js
cat source/easyXDM/easyXDM.min.js | uglifyjs >> geoloqi.min.js
cat source/geoloqi-client.js | uglifyjs >> geoloqi.min.js
cat source/geoloqi-maps.js | uglifyjs >> geoloqi.min.js
cat source/geoloqi-sockets.js | uglifyjs >> geoloqi.min.js