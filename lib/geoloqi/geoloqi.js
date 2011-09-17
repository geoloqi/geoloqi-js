var https = require('https');
var querystring = require('querystring');

var geoloqi = (function () {

  var exports = {};
  exports.version = '0.0.1'

  function Session(auth, config) {
    var self = this;
    var exports = {};
    var validMethods = ['GET', 'POST'];

    auth = auth || {};
    config = config || {};

    // config.api_url = 'https://api.geoloqi.com';
    config.api_version = '1';
    config.oauth_url = 'https://beta.geoloqi.com/oauth/authorize';

    function get(path, callback) {
      execute('GET', path, {}, callback);
    }
    exports.get = get;

    function post(path, args, callback) {
      execute('POST', path, args, callback);
    }
    exports.post = post;

    function execute(method, path, args, callback) {
      if(typeof(method) === 'undefined') {
        throw new Error('Argument Error: method was not supplied for execute()');
      }

      method = method.toUpperCase();

      var validMethod = false;
      for(var i=0; i<validMethods.length; i++) {
        if(validMethods[i] === method) {
          validMethod = true;
        }
      }

      if(!validMethod) {
        throw new Error('Argument Error: HTTP Method "'+method+'" is not supported');
      }

      if(typeof(path) === 'undefined') {
        throw new Error('Argument Error: Missing path');
      }

      headers = {'Content-Type': 'application/json',
                 'User-Agent': 'geoloqi-js '+geoloqi.version,
                 'Accept': 'application/json'};

      if(typeof(auth.access_token) !== 'undefined') {
        headers['Authorization'] = 'OAuth '+auth.access_token;
      }

      // Use HTTP client for node if process exists
      if(typeof(process) === 'object') {
        var options = {
          host: 'api.geoloqi.com',
          port: 443,
          path: '/1/'+path,
          method: 'GET',
          headers: headers
        };

        var req = https.request(options, function(res) {
          res.setEncoding('utf-8');
          res.on('data', function(data) {
            callback(data.toString());
          });
        });
        req.write(querystring.stringify(args));
        req.end();

        req.on('error', function(e) {
          callback(null, e);
        });
      }
    }
    exports.execute = execute;

    return exports;
  }
  exports.Session = Session;

  return exports;
}());