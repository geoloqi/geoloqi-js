if(typeof(process) === 'object') {
  var http = require('http');
  var https = require('https');
}

var geoloqi = (function (exports) {

  if(typeof(exports) === 'undefined') {
    var exports = {};
  }

  exports.version = '0.0.1';

  function Session(auth, suppliedConfig) {
    var self = this;
    var exports = {};
    var validMethods = ['GET', 'POST'];


    var config = {
      'api_protocol': 'https',
      'api_url': 'api.geoloqi.com',
      'api_version': 1,
      'oauth_url': 'https://beta.geoloqi.com/oauth/authorize'
    };


    auth = auth || {};
    util.merge(config, suppliedConfig);


    function get(path, callback) {
      execute('GET', path, {}, callback);
    }
    exports.get = get;


    function post(path, args, callback) {
      execute('POST', path, args, callback);
    }
    exports.post = post;


    function execute(method, path, args, callback) {


      // Scrub the data to look for common errors
      
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
                 'User-Agent': 'geoloqi-js '+geoloqi.version,
                 'Accept': 'application/json'};

      if(typeof(auth.access_token) !== 'undefined') {
        headers['Authorization'] = 'OAuth '+auth.access_token;
      }


      // Use HTTP client for node if process exists

      if(util.isRunningNode) {
        
        var httpOptions = {
          host: config.api_url,
          port: (config.api_protocol === 'https' ? 443 : 80),
          path: '/'+config.api_version+'/'+path,
          method: method,
          headers: headers
        };


        var req = eval(config.api_protocol).request(httpOptions, function(res) {
          res.setEncoding('utf-8');
          res.on('data', function(data) {
            callback(data.toString());
          });
        });


        req.end(JSON.stringify(args));


        req.on('error', function(e) {
          callback(null, e);
        });
      } else {
        
        var xhr = util.getXHR();
        
        xhr.onreadystatechange = function(){
          if (4 === xhr.readyState) callback(xhr.responseText);
        };

        var fullUrl = config.api_protocol+'://'+config.api_url+'/'+config.api_version+'/'+path;
        xhr.open(method, fullUrl, true);

        // set header fields
        for (var field in headers) {
//          xhr.setRequestHeader(field, headers[field]);
          console.log(field+': '+headers[field]);
          xhr.setRequestHeader('Accept', 'application/json');
          
//          xhr.setRequestHeader('User-Agent', 'geoloqi-js 0.1.1');
//            xhr.setRequestHeader('Content-Type', 'application/json');

//          xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"); 

          
//          xhr.setRequestHeader('');
        }

        // body
        if (method === 'POST') {
          xhr.send(JSON.stringify(args));
          
          // content-length
//          if (null != data && !this.header['content-length']) {
//            this.set('Content-Length', data.length);
//          }
        } else {
          xhr.send();
        }


      }
    }
    exports.execute = execute;

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
  

  util.getXHR = function() {
    if (window.XMLHttpRequest
      && ('file:' != window.location.protocol || !window.ActiveXObject)) {
      return new XMLHttpRequest;
    } else {
      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.6.0');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP.3.0');
      } catch(e) {}
      try {
        return new ActiveXObject('Msxml2.XMLHTTP');
      } catch(e) {}
    }
    return false;
  }
  
  util.serialize = function(obj) {
    if (!isObject(obj)) return obj;
    var pairs = [];
    for (var key in obj) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
    return pairs.join('&');
  }
  
  util.isRunningNode = (typeof(process) === 'object');
  
  exports.isRunningNode = util.isRunningNode;

  return exports;
}());


var session = new geoloqi.Session({'access_token': 'ACCESS TOKEN GOES HERE'});

session.get('account/profile', function(result, err) {
  console.log(result);
});



