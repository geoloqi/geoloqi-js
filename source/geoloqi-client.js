var geoloqi = (function () {
  var version = '1.0.0',
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
    cookieName = '_geoloqi_auth',
    config = {},
    auth = null,
    util = {},
    onAuthorize = null,
    onOAuthError = null;

  var socket = new easyXDM.Socket({
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
          payload.error = JSON.parse(payload.error);
        }
        
        anonymousCallbacks[payload.callbackId](payload.response, payload.error);
      }
    }
  });

  exports.config = config;
  exports.onAuthorize = onAuthorize;
  exports.onOAuthError = onOAuthError;

  function init(config) {
    var fragment = document.location.hash.substring(1),
        newAuth = {};

    exports.auth = JSON.parse(util.cookie.get());

    self.config = config;

    if (fragment !== "") {
      processAuth(fragment);
    }
  }
  exports.init = init;
  exports.auth = auth;

  function processAuth(fragment) {
    var newAuth = util.objectify(fragment);

    if (newAuth.access_token && newAuth.expires_in) {
      exports.auth = newAuth;
      util.cookie.set(JSON.stringify(newAuth), newAuth.expires_in);

      if(exports.onAuthorize !== null) {
        exports.onAuthorize();
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
      execute('GET', path, args, callback);
    } else if(arguments.length == 2) {
      execute('GET', arguments[0], {}, arguments[1]);
    }
  }
  exports.get = get;

  function post(path, args, callback) {
    execute('POST', path, args, callback);
  }
  exports.post = post;

  function execute(method, path, args, callback) {
    var callbackId = util.guid(),
      message = {};

    if (!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }

    message = {'method': method,
               'path': path,
               'args': args,
               'accessToken': exports.auth.access_token,
               'callbackId': callbackId,
               'version': version};
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

  util.cookie = (function () {
    var exports = {};

    function set(value, secondsUntilExpire) {
      if (secondsUntilExpire) {
        var date = new Date();
        date.setTime(date.getTime()+(secondsUntilExpire*1000));
        var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = cookieName + "=" + value + expires + "; path=/";
    }
    exports.set = set;

    function get() {
      var nameEQ = cookieName + "=";
      var ca = document.cookie.split(';');
      for (var i=0;i < ca.length;i++) {
	      var c = ca[i];
	      while (c.charAt(0)==' ') c = c.substring(1,c.length);
	      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
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

  util.guid = function () {
    return 'g' + (Math.random() * (1<<30)).toString(16).replace('.', '');
  }

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
