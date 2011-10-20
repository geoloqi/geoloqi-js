cat easyXDM/json2.min.js easyXDM/easyXDM.min.js lib/geoloqi-client.js lib/geoloqi-maps.js lib/geoloqi-sockets.js | uglifyjs -o geoloqi.min.js
echo "Built geoloqi-min.js"