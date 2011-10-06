var https = require('https');
var querystring = require('querystring');
var module = this;
exports.version = '0.0.1';

exports.config = {
  'api_url': 'api.geoloqi.com',
  'api_version': 1,
  'oauth_url': 'https://beta.geoloqi.com/oauth/authorize',
  'debug': false
};

function Session(auth, suppliedConfig) {
  var exports = {};
  var validMethods = ['GET', 'POST'];
  var auth = auth || {};
  var config = module.config;
  config = util.merge(config, suppliedConfig);
  exports.config = config;

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
               'User-Agent': 'geoloqi-node '+module.version,
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
      console.log('ERROR WITH EXECUTE!');
      console.log(e);
      callback(null, e);
    });
  }
  exports.execute = execute;

  function refreshAccessToken(code, callback) {
    
  }

  function authorize(code, callback) {
    checkConfig();

    var queryObj = {'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': config.redirect_uri,
                    'client_id': config.client_id,
                    'client_secret': config.client_secret};

    var queryString = querystring.stringify(queryObj);

    var httpOptions = {
      host: config.api_url,
      path: '/'+config.api_version+'/oauth/token',
      method: 'POST',
      headers: {'User-Agent': 'geoloqi-js '+module.version,
                'Content-Length': queryString.length,
                'Content-Type': 'application/x-www-form-urlencoded'}
    };

    var req = https.request(httpOptions, function(res) {
      res.setEncoding('utf-8');
      res.on('data', function(data) {
        callback(JSON.parse(data));
      });
    });

    req.end(queryString);

    req.on('error', function(e) {
      console.log('ERROR WITH AUTHORIZE!');
      console.log(e);
      callback(null, e);
    });
  }
  exports.authorize = authorize;

  function oauthUrl() {
    checkConfig();

    var queryObj = {'response_type': 'code', 'client_id': config.client_id, 'redirect_uri': config.redirect_uri}
    return config.oauth_url+"?"+querystring.stringify(queryObj);
  }
  exports.oauthUrl = oauthUrl;

  function checkConfig() {
    if(typeof(config.redirect_uri) == 'undefined')
      throw new Error('Error: redirect_uri not provided, add to Session config');

    if(typeof(config.client_id) == 'undefined')
      throw new Error('Error: client_id not provided, add to Session config');

    if(typeof(config.client_secret) == 'undefined')
      throw new Error('Error: client_secret not provided, add to Session config');
  }

  return exports;
}
exports.Session = Session;

//Private Utility Helpers
var util = {};

util.merge = function(obj1, obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}

//From socket.io.js who got it from http://webreflection.blogspot.com/2007/09/tod-most-compact-arrayprototypeindexof.html
util.indexOf = function (arr, o, i) {
  if (Array.prototype.indexOf) {
    return Array.prototype.indexOf.call(arr, o, i);
  }

  for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0;
       i < j && arr[i] !== o; i++);

  return j <= i ? -1 : i;
};