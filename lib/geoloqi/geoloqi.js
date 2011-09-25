var https = require('https');

exports.version = '0.0.1';

function Session(auth, suppliedConfig) {
  var self = this;
  var exports = {};
  var validMethods = ['GET', 'POST'];

  var config = {
    'api_url': 'api.geoloqi.com',
    'api_version': 1,
    'oauth_url': 'https://beta.geoloqi.com/oauth/authorize'
  };

  auth = auth || {};
  util.merge(config, suppliedConfig);
  exports.config = config;
  exports.oauth_url = config.oauth_url;

  function get(path, callback) {
    if(arguments.length != 2)
      throw new Error('Missing fields for get(): path, callback');

    run('GET', path, {}, callback);
  }
  exports.get = get;

  function post(path, args, callback) {
    if(arguments.length != 3)
      throw new Error('Missing fields for post(): path, args, callback');

    run('POST', path, args, callback);
  }
  exports.post = post;

  // Same as execute but parses JSON.
  function run(method, path, args, callback) {
    execute(method, path, args, function(result, err) {
      callback(JSON.parse(result), err);
    });
  }

  // Does the low level call.
  function execute(method, path, args, callback) {
    if(typeof(method) !== 'string') {
      throw new Error('Argument Error: HTTP method was not supplied for execute(), or was not a string');
    }

    method = method.toUpperCase();

    if(util.indexOf(validMethods, method) === -1) {
      throw new Error('Argument Error: HTTP Method "'+method+'" is not supported');
    }

    if(typeof(path) === 'undefined') {
      throw new Error('Argument Error: Missing path');
    }

    // Build the headers
    headers = {'Content-Type': 'application/json',
               'User-Agent': 'geoloqi-js '+exports.version,
               'Accept': 'application/json'};

    if(typeof(auth.access_token) !== 'undefined') {
      headers['Authorization'] = 'OAuth '+auth.access_token;
    }

    var httpOptions = {
      host: config.api_url,
      path: '/'+config.api_version+'/'+path,
      method: method,
      headers: headers
    };

    var req = https.request(httpOptions, function(res) {
      res.setEncoding('utf-8');
      res.on('data', function(data) {
        callback(data);
      });
    });

    req.end(JSON.stringify(args));

    req.on('error', function(e) {
      callback(null, e);
    });
  }
  exports.execute = execute;



  function authorize(code) {

    var httpOptions = {
      host: config.api_url,
      port: (config.api_protocol === 'https' ? 443 : 80),
      path: '/'+config.api_version+'/oauth/token',
      method: 'POST'
    };

    var req = eval(config.api_protocol).request(httpOptions, function(res) {
      res.setEncoding('utf-8');
      res.on('data', function(data) {
        callback(data.toString());
      });
    });

    if(typeof(config.redirect_uri) == 'undefined')
      throw new Error('Error: redirect_uri not provided, add to Session config');

    if(typeof(config.client_id) == 'undefined')
      throw new Error('Error: client_id not provided, add to Session config');

    if(typeof(config.client_secret) == 'undefined')
      throw new Error('Error: client_secret not provided, add to Session config');

    req.end(querystring.stringify({'grant_type': 'authorization_code',
                                   'code': code,
                                   'redirect_uri': config.redirect_uri,
                                   'client_id': config.client_id,
                                   'client_secret': config.client_secret}));

    req.on('error', function(e) {
      callback(null, e);
    });

    // https://api.geoloqi.com/1/oauth/token
    // Post Body:
    // grant_type=authorization_code&code=CODE_FROM_QUERY_STRING&redirect_uri=REDIRECT_URI
    // &client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET
  }

  return exports;
}
exports.Session = Session;

//Private Utility Helpers
var util = {};

//From socket.io.js
util.merge = function merge (target, additional, deep, lastseen) {
  var seen = lastseen || [],
      depth = typeof deep == 'undefined' ? 2 : deep,
      prop;

  for (prop in additional) {
    if (additional.hasOwnProperty(prop) && util.indexOf(seen, prop) < 0) {
      if (typeof target[prop] !== 'object' || !depth) {
        target[prop] = additional[prop];
        seen.push(additional[prop]);
      } else {
        util.merge(target[prop], additional[prop], depth - 1, seen);
      }
    }
  }

  return target;
};

//From socket.io.js who got it from http://webreflection.blogspot.com/2007/09/tod-most-compact-arrayprototypeindexof.html
util.indexOf = function (arr, o, i) {
  if (Array.prototype.indexOf) {
    return Array.prototype.indexOf.call(arr, o, i);
  }

  for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
       i < j && arr[i] !== o; i++);

  return j <= i ? -1 : i;
};