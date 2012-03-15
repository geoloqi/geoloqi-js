var geoloqi = (function () {
  var version = '1.0.8',
  build_version = '',
  anonymousCallbacks = {},
  self = this,
  exports = {},
  apiUrl = 'https://api.geoloqi.com',
  receiverPath = '/js/',
  receiverUrl = apiUrl + receiverPath + 'receiver.html',
  oauthUrl = 'https://geoloqi.com',
  oauthPath = '/oauth/authorize',
  fullOauthUrl = oauthUrl + oauthPath,
  iframe = null,
  _geoloqiEasyXDM = easyXDM.noConflict(_geoloqiEasyXDM),
  cookieName = '_geoloqi_auth',
  config = {},
  auth = null,
  locationWatcher = null,
  util = {},
  onAuthorize = null,
  onOAuthError = null,
  onLoginError = null;
  
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
        
        anonymousCallbacks[payload.callbackId](payload.response, payload.error);
      }
    }
  });

  exports.config = config;
  exports.onAuthorize = onAuthorize;
  exports.onOAuthError = onOAuthError;
  exports.onLoginError = onLoginError;

  function init(config) {
    var fragment = document.location.hash.substring(1),
        newAuth = {};

    exports.auth = util.session.load();

    self.config = config;

    if (fragment !== "") {
      processAuth(fragment);
    }
  }
  exports.init = init;
  exports.auth = auth;

  function processAuth(fragment_or_object) {
    if (typeof fragment_or_object === 'string') {
      var newAuth = util.objectify(fragment_or_object);
    } else {
      var newAuth = fragment_or_object;
    }

    if (newAuth) {
      exports.auth = newAuth;

      util.session.create(newAuth);

      if(exports.onAuthorize !== null) {
        exports.onAuthorize(newAuth);
      }
    }
  }

  function returnFromPopup(auth) {
    processAuth(auth);
  }

  function authenticate() {
    authenticatePrompt(true);
  }
  exports.authenticate = authenticate;

  function authenticateWithRedirect() {
    authenticatePrompt(false);
  }
  exports.authenticateWithRedirect = authenticate.authenticateWithRedirect;

  function authenticateWithPopup() {
    authenticatePrompt(true);
  }
  exports.authenticateWithPopup = authenticateWithPopup;

  function authenticatePrompt(popup) {
    var args = {},
        url = '';
    if (auth === null) {

      args = {'response_type': 'token', 'client_id': self.config.client_id};

      if (self.config.redirect_uri) {
        args.redirect_uri = self.config.redirect_uri;
      }

      if (popup === true) {
        args.mode = 'popup';
      }
      url = oauthUrl + oauthPath + '?' + util.serialize(args);

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
    util.cookie.erase();
  }
  exports.expire = expire;

  function get(path, args, callback) {
    if(arguments.length == 3) {
      executeWithAccessToken('GET', path, args, callback);
    } else if(arguments.length == 2) {
      executeWithAccessToken('GET', arguments[0], {}, arguments[1]);
    }
  }
  exports.get = get;

  function post(path, args, callback) {
    executeWithAccessToken('POST', path, args, callback);
  }
  exports.post = post;

  function login(args) {
    execute('POST', 'oauth/token', {
      'grant_type' : 'password',
      'client_id' : self.config.client_id,
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

  function executeWithAccessToken(method, path, args, callback) {
    if (!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }
    execute(method, path, args, callback);
  }

  function execute(method, path, args, callback) {
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
      'packageName': (config.package_name) ? config.package_name : "",
      'packageVersion': (config.package_version) ? config.package_version : ""
    };
    anonymousCallbacks[callbackId] = callback;
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

      anonymousCallbacks[payload.callbackId](payload.response, payload.error);
    }
  }
  exports.receive = receive;
  
  /*
  Utilities for manipulating sessions
  -----------------------------------
  */
  
  util.session = (function(){
    var exports = {}

    try {
      localStorage.setItem("mod", "mod");
      localStorage.removeItem("mod");
      localStorageTest = true;
    } catch(e) {
      localStorageTest = false;
    }

    featureLevel = (localStorageTest) ? "localStorage" : "cookie";
    persist = (config.persist) ? config.persist : featureLevel;
    
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
  }

  util.objectify = function (queryString) {
    var result = {};
    var re = /([^&=]+)=([^&]*)/g;
    var m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
  }

  
  /*
  Utilities for working with cookies
  ----------------------------------
  */

  util.cookie = (function () {
    var exports = {};

    function set(value, secondsUntilExpire) {
      if (secondsUntilExpire) {
        var date = new Date();
        date.setTime(date.getTime()+(secondsUntilExpire*1000));
        var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = cookieName + "=" + JSON.stringify(value) + expires + "; path=/";
    }
    exports.set = set;

    function get() {
      var nameEQ = cookieName + "=";
      var ca = document.cookie.split(';');
      for (var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return JSON.parse(c.substring(nameEQ.length,c.length));
      }

      return null;
    }
    exports.get = get;

    function erase() {
      set("",-1);
    }
    exports.erase = erase;

    return exports;
  }());
  
 
  /*
  Utilities for working with localStorage
  ---------------------------------------
  */
  util.localStorage = (function () {
    var exports = {};

    function set(value){
      localStorage.setItem(cookieName, JSON.stringify(value));
    };
    exports.set = set;
    
    function get(){
      return JSON.parse(localStorage.getItem(cookieName));
    };
    exports.get = get;
    
    function erase(){
      set("");
    };
    exports.erase = erase;

    return exports;
  }());

  /*
  Utilities for working with dates
  --------------------------------
  */
  
  util.date = {};

  util.date.toISO8601 = function(d){
   function pad(n){return n<10 ? '0'+n : n};
   return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getUTCHours())+':'
        + pad(d.getUTCMinutes())+':'
        + pad(d.getUTCSeconds())+'Z';
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
  }

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
    
    geoloqi.post("location/update", {
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
      raw: this.settings.raw,
    });
    if(typeof settings.success === "function"){
      settings.success.apply(settings.context, [position]);
    }
  };

  watchLocation = function (opts) {
    var object = function () {
      var self = this;
      this.settings = util.merge(pointDefaults, opts);
      this.settings.context = (!this.settings.context) ? this : this.settings.context;

      this.success = function(position){
        sendPoint(position, self.settings);
      };

      this.error = function(error){
        if(typeof self.settings.error === "error"){
          self.settings.error.call(self.settings.context, [error]);
        }
      };

      this._watcher = navigator.geolocation.watchPosition(this.success, this.error, {
        enableHighAccuracy: true
      });
    };

    object.prototype = {
      stop: function(){
        console.log(this._watcher);
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
    };
  };
  exports.watchLocation = watchLocation;

  updateLocation = function(opts){
    settings = util.merge(pointDefaults, opts);
    function success(position){
      sendPoint(position, settings);
      if(typeof settings.success === "function"){
        settings.success.apply(settings.context, [position]);
      }
    };
    
    function error(){
      if(typeof settings.error === "function"){
        settings.error.apply(settings.context, [position]);
      }
    };

    if(logged_in() && navigator.geolocation){
      navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true
      });
    } else if(!navigator.geolocation) {
      throw "Client does not support HTML5 Geolocation. This function is unavailable";
    } else if(!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    };
  };
  exports.updateLocation = updateLocation;

  return exports;

}());

/*
window.onload = function () {
  geoloqi.init();
}
*/

window.addEventListener("message", function(event) {
  geoloqi.receive(event);
});