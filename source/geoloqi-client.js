var geoloqi = (function () {
  var version = '1.0.17';
  var build_version = 'e0e169bd431f9782febbc7ea5a52694b40b30dc9';
  var anonymousCallbacks = {},
  self = this,
  exports = {},
  apiUrl = 'https://api.geoloqi.com',
  receiverPath = '/js/',
  receiverUrl = apiUrl + receiverPath + 'receiver.html',
  oauthUrl = 'https://geoloqi.com',
  oauthPath = '/oauth/authorize',
  fullOauthUrl = oauthUrl + oauthPath,
  iframe = null,
  _geoloqiEasyXDM = easyXDM.noConflict("geoloqi"),
  cookieName = '_geoloqi_auth',
  config = {},
  auth = null,
  locationWatcher = null,
  util = {},
  onAuthorize = null,
  onOAuthError = null,
  onLoginError = null;
  defaultConfig = {
    package_name: null,
    package_version: null
  };

  var socket = new _geoloqiEasyXDM.Socket({
    remote: receiverUrl,
    onMessage: function(message, origin){
      if(origin != apiUrl && origin != oauthUrl) {
        return false;
      }

      var payload = JSON.parse(message);

      if(typeof payload.oauth === 'object') {

        if(typeof payload.oauth.auth === 'string') {
          returnFromPopup(payload.oauth.auth);
        }

        if(typeof payload.oauth.error === 'string' && exports.onOAuthError !== null) {
          exports.onOAuthError(payload.oauth.error);
        }

      } else {

        if (typeof payload.response === 'string') {
          payload.response = JSON.parse(payload.response);
        }

        if (typeof payload.error === 'string') {
          if (payload.error[0] == "{") {
            payload.error = JSON.parse(payload.error);
          } else {
            payload.error = {error_code: 500, error: "unknown_error", error_description: payload.error};
          }
        }
        if(typeof anonymousCallbacks[payload.callbackId] === "function"){
          anonymousCallbacks[payload.callbackId](payload.response, payload.error);
        }
      }
    }
  });

  function init(opts) {
    var fragment = document.location.hash.substring(1),
        newAuth = {};

    config = (opts) ? util.merge(defaultConfig, opts) : defaultConfig;

    if (fragment !== "") {
      processAuth(fragment);
    }

    if(config.apiKey){
      config.client_id = config.apiKey;
    }

    if(!exports.auth && config.createOrRestoreUser && !processAuth(util.session.load())) {
      geoloqi.execute("POST", "user/create_anon", {
        client_id: config.client_id
      }, function(response, error){
        if(!error){
          processAuth(response);
        }
      });
    }
  }

  exports.init = init;
  exports.auth = auth;
  exports.config = config;
  exports.onAuthorize = onAuthorize;
  exports.onOAuthError = onOAuthError;
  exports.onLoginError = onLoginError;

  function processAuth(fragment_or_object) {
    var newAuth;
    if (typeof fragment_or_object === 'string') {
      newAuth = util.objectify(fragment_or_object);
    } else {
      newAuth = fragment_or_object;
    }

    if (newAuth) {
      exports.auth = newAuth;

      util.session.create(newAuth);

      if(exports.onAuthorize !== null) {
        exports.onAuthorize(newAuth);
      }
    }

    return exports.auth;
  }

  function returnFromPopup(auth) {
    processAuth(auth);
  }

  function authenticate() {
    window.console && console.log('WARNING: OAuth features will be removed from a future version of geoloqi.js');
    authenticatePrompt(true);
  }
  exports.authenticate = authenticate;

  function authenticateWithRedirect() {
    window.console && console.log('WARNING: OAuth features will be removed from a future version of geoloqi.js');
    authenticatePrompt(false);
  }
  exports.authenticateWithRedirect = authenticate.authenticateWithRedirect;

  function authenticateWithPopup() {
    window.console && console.log('WARNING: OAuth features will be removed from a future version of geoloqi.js');
    authenticatePrompt(true);
  }
  exports.authenticateWithPopup = authenticateWithPopup;

  function authenticatePrompt(popup) {
    var args = {},
        url = '';
    if (auth === null) {
      args = {'response_type': 'token', 'client_id': config.client_id};

      if (config.redirect_uri) {
        args.redirect_uri = config.redirect_uri;
      }

      if (popup === true) {
        args.mode = 'popup';
      }
      url = oauthUrl + oauthPath + '?' + util.serialize(args);
      util.serialize(args);
      if (popup === true) {
        var popupWindow = window.open(url,'_geoloqi_auth_popup','height=500,width=700');
        if (window.focus) {
          popupWindow.focus();
        }
      } else {
        window.location = url;
      }
    }
  }

  function logged_in() {
    return (exports.auth && exports.auth.access_token) ? true : false;
  }
  exports.logged_in = logged_in;

  function expire() {
    exports.auth = null;
    util.session.destroy();
  }
  exports.expire = expire;

  function get(path, args, callback, context) {
    if(arguments.length == 4) {
      executeWithAccessToken('GET', path, args, callback, context);
    } else if(arguments.length == 3) {
      if(typeof arguments[1] === "function" && typeof arguments[2] === "object"){
        alias_callback = arguments[1];
        alias_context = arguments[2];
        executeWithAccessToken('GET', path, {}, alias_callback, alias_context);
      } else {
        executeWithAccessToken('GET', path, args, callback);
      }
    } else if(arguments.length == 2) {
      // path, callback
      callback = arguments[1];
      executeWithAccessToken('GET', path, {}, callback);
    }
  }
  exports.get = get;

  function post(path, args, callback, context) {
    executeWithAccessToken('POST', path, args, callback, context);
  }
  exports.post = post;

  function login(args) {
    execute('POST', 'oauth/token', {
      'grant_type' : 'password',
      'client_id' : config.client_id,
      'username' : args.username,
      'password' : args.password
    }, processLoginCallback);
  }
  exports.login = login;

  function processLoginCallback(response, error) {
    if(!error) {
      processAuth(response);
    } else {
      exports.onLoginError(error);
    }
  }

  function executeWithAccessToken(method, path, args, callback, context) {
    if (!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }
    execute(method, path, args, callback, context);
  }

  function execute(method, path, args, callback, context) {
    var callbackId = util.guid(),
        message = {};

    if(method == 'POST' && typeof(args) === 'string') {
      args = util.objectify(args);
    }
    var access_token = (exports.auth !== null) ? exports.auth.access_token : '';
    message = {
      'method': method,
      'path': path,
      'args': args,
      'accessToken': access_token,
      'callbackId': callbackId,
      'sdkVersion': version,
      'sdkBuild': build_version,
      'packageName': (config.package_name) ? config.package_name : null,
      'packageVersion': (config.package_version) ? config.package_version : null
    };
    if(callback){
      anonymousCallbacks[callbackId] = (context) ? util.bind(callback, context) : callback;
    }
    socket.postMessage(JSON.stringify(message));
  }
  exports.execute = execute;

  /* Receive the response from the iframe and execute the callback stored in an array (yes, this is how you're supposed to do it).
     We also check to make sure it was actually sent from Geoloqi, because other API libraries may be using postMessage as well. */

  function receive(event) {

    if(event.origin != oauthUrl) {
      return false;
    }

    var payload = JSON.parse(event.data);

    if(typeof payload.oauth === 'object') {

      if(typeof payload.oauth.auth === 'string') {
        returnFromPopup(payload.oauth.auth);
      }

      if(typeof payload.oauth.error === 'string' && exports.onOAuthError !== null) {
        exports.onOAuthError(payload.oauth.error);
      }

    } else {

      if (typeof payload.response === 'string') {
        payload.response = JSON.parse(payload.response);
      }

      if (typeof payload.error === 'string') {
        payload.error = JSON.parse(payload.error);
      }
      if(typeof anonymousCallbacks[payload.callbackId] === "function"){
        anonymousCallbacks[payload.callbackId](payload.response, payload.error);
      }
    }
  }
  exports.receive = receive;

  /*
  Utilities for manipulating sessions
  -----------------------------------
  */

  util.session = (function(){
    var exports = {};

    try {
      localStorage.setItem("mod", "mod");
      localStorage.removeItem("mod");
      localStorageTest = true;
    } catch(e) {
      localStorageTest = false;
    }

    feature = (localStorageTest) ? "localStorage" : "cookie";
    persist = (config.persist) ? config.persist : feature;

    create = function(string){
      util[persist].set(string);
    };
    exports.create = create;

    load = function(){
      return util[persist].get();
    };
    exports.load = load;

    destroy = function(){
      util[persist].erase();
    };
    exports.destroy = destroy;

    return exports;
  }());

  util.serialize = function (obj) {
    var str = [];
    for (var p in obj)
       str.push(p + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  };

  util.objectify = function (queryString) {
    var result = {};
    var re = /([^&=]+)=([^&]*)/g;
    var m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
  };


  /*
  Utilities for working with cookies
  ----------------------------------
  */

  util.cookie = {
    set: function(value, secondsUntilExpire) {
      var expires;
      if (secondsUntilExpire) {
        var date = new Date();
        date.setTime(date.getTime()+(secondsUntilExpire*1000));
        expires = "; expires="+date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = cookieName + "=" + JSON.stringify(value) + expires + "; path=/";
    },
    get: function() {
      var nameEQ = cookieName + "=";
      var ca = document.cookie.split(';');
      for (var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return JSON.parse(c.substring(nameEQ.length,c.length));
      }

      return null;
    },
    erase: function() {
      util.cookie.set("",-1);
    }
  };


  /*
  Utilities for working with localStorage
  ---------------------------------------
  */
  util.localStorage = {
    set:function(value){
      localStorage.setItem(cookieName, JSON.stringify(value));
    },
    get: function(){
      return JSON.parse(localStorage.getItem(cookieName));
    },
    erase: function(){
      localStorage.removeItem(cookieName);
    }
  };

  /*
  Utilities for working with dates
  --------------------------------
  */

  util.date = {};

  util.date.toISO8601 = function(d){
    function pad(n){
      return n<10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+'-' +
          pad(d.getUTCMonth()+1)+'-' +
          pad(d.getUTCDate())+'T' +
          pad(d.getUTCHours())+':' +
          pad(d.getUTCMinutes())+':' +
          pad(d.getUTCSeconds())+'Z';
  };

  /*
  GUID Utility
  ------------
  */

  util.guid = function() {
    return 'g' + (Math.random() * (1<<30)).toString(16).replace('.', '');
  };

  /*
  Utilities for deep and shallow merging of objects
  -------------------------------------------------
  */

  util.merge = function(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  };

  util.mergeDeep = function(obj1, obj2) {

    for (var p in obj2) {
      try {
        // Property in destination object set; update its value.
        if ( obj2[p].constructor==Object ) {
          obj1[p] = MergeRecursive(obj1[p], obj2[p]);

        } else {
          obj1[p] = obj2[p];

        }

      } catch(e) {
        // Property in destination object not set; create it and set its value.
        obj1[p] = obj2[p];

      }
    }

    return obj1;
  };

  util.toQueryString= function(obj, parentObject) {
    if( typeof obj != 'object' ) return '';

    var rv = '';
    for(var prop in obj) if (obj.hasOwnProperty(prop) ) {

      var qname = (parentObject) ? parentObject + '.' + prop : prop;

      // Expand Arrays
      if (obj[prop] instanceof Array) {
        for( var i = 0; i < obj[prop].length; i++ ){
          if( typeof obj[prop][i] == 'object' ){
            rv += '&' + obj2query( obj[prop][i], qname );
          } else{
            rv += '&' + encodeURIComponent(qname) + '=' + encodeURIComponent( obj[prop][i] );
          }
        }
      // Expand Dates
      } else if (obj[prop] instanceof Date) {
        rv += '&' + encodeURIComponent(qname) + '=' + obj[prop].getTime();

      // Expand Objects
      } else if (obj[prop] instanceof Object) {
        // If they're String() or Number() etc
        if (obj.toString && obj.toString !== Object.prototype.toString){
          rv += '&' + encodeURIComponent(qname) + '=' + encodeURIComponent( obj[prop].toString() );
        // Otherwise, we want the raw properties
        } else{
          rv += '&' + obj2query(obj[prop], forPHP, qname);
        }
      // Output non-object
      } else {
        rv += '&' + encodeURIComponent(qname) + '=' + encodeURIComponent( obj[prop] );
      }
    }
    return rv.replace(/^&/,'');
  };

  //Adapted from underscore.js
  util.bind = function(func, context) {
    var bound, args;
    if (typeof func !== "function") throw new TypeError();
    if (typeof Function.prototype.bind == 'function') return func.bind(context);
    args = Array.prototype.slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor();
      var result = func.apply(self, args.concat(Array.prototype.slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

/*
  HTML5 Geolocation helpers
  -------------------------
  */

  pointDefaults = {
    success: null,
    error: null,
    context: null,
    raw: null
  };

  sendPoint = function(position, settings){
    geoloqi.post("location/update", [{
      date: util.date.toISO8601(new Date(position.timestamp)),
      location: {
        position: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: (position.coords.speed) ? position.coords.speed : 0,
          altitude: (position.coords.altitude) ? position.coords.altitude : 0,
          horizontal_accuracy: position.coords.accuracy,
          vertical_accuracy: (position.coords.altitudeAccuracy) ? position.coords.altitudeAccuracy : 0
        },
        type: "point"
      },
      raw: settings.raw
    }]);
    if(typeof settings.success === "function"){
      settings.success.apply(settings.context, [position]);
    }
  };

  updateLocation = function(opts){
    settings = util.merge(pointDefaults, opts);

    function success(position){
      sendPoint(position, settings);
    }

    function error(){
      if(typeof settings.error === "function"){
        settings.error.apply(settings.context);
      }
    }

    if(logged_in() && navigator.geolocation){
      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true
      });
    } else if(!navigator.geolocation) {
      throw "Client does not support HTML5 Geolocation. This function is unavailable";
    } else if(!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }
  };
  exports.updateLocation = updateLocation;

  watchPosition = function (opts) {
    var object = function () {
      var self = this;
      this.settings = util.merge(pointDefaults, opts);
      this.settings.context = (!this.settings.context) ? this : this.settings.context;
      this.success = function(position){
        sendPoint(position, self.settings);
      };
      this.error = function(){
        if(typeof self.settings.error === "function"){
          self.settings.error.call(self.settings.context);
        }
      };
      this.start();
    };
    object.prototype = {
      stop: function(){
        navigator.geolocation.clearWatch(this._watcher);
      },
      start: function(){
        this._watcher = navigator.geolocation.watchPosition(this.success, this.error, {
          enableHighAccuracy: true
        });
      }
    };
    if(logged_in() && navigator.geolocation){
      return new object();
    } else if(!navigator.geolocation) {
      throw "Client does not support HTML5 Geolocation. This function is unavailable";
    } else if(!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }
  };
  exports.watchPosition = watchPosition;

  Batch = function(){

    var object = function(){
      this.jobs = [];
    };

    object.prototype = {
      get: function(path, query, headers){
        this.build_request(path+"?"+util.toQueryString(query), {}, headers);
        return this;
      },
      post: function(path, query, headers){
        this.build_request(path, query, headers);
        return this;
      },
      build_request: function(path, query, headers){
        this.jobs.push({
          relative_url: path,
          body: query,
          headers: headers
        });
        return this;
      },
      run: function(callback, context){
        if(!logged_in()) {
          throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
        }
        post('batch/run', {
          access_token: exports.auth.access_token,
          batch: this.jobs
        }, callback, context);
        return this;
      },
      clear: function(){
        this.jobs = [];
        return this;
      }
    };

    return new object();
  };
  exports.Batch = Batch;

  return exports;

}());

/*
window.onload = function () {
  geoloqi.init();
}
*/

if (window.addEventListener){
  window.addEventListener("message", function(event) {
    geoloqi.receive(event);
  });
} else if (window.attachEvent) {
  window.attachEvent("onmessage", function(event) {
    geoloqi.receive(event);
  });
}