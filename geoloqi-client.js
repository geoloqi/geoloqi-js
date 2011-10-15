var geoloqi = (function () {
  var version = '0.0.1',
    anonymousCallbacks = {},
    self = this,
    exports = {},
    receiverUrl = 'https://api.geoloqi.com/js/receiver.html',
    oauthUrl = 'https://geoloqi.com/oauth/authorize',
    geoloqiRootId = 'geoloqi-root',
    iframe = null,
    cookieName = '_geoloqi_auth',
    config = {},
    auth = null,
    util = {};

  exports.config = config;

  function init(config) {
    var iframeContainer = document.getElementById(geoloqiRootId),
      anchorString = document.location.hash.substring(1),
      newAuth = {};

    iframe = document.createElement("iframe");
    iframe.setAttribute("src", receiverUrl);
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "0px";
    iframeContainer.appendChild(iframe);
    self.auth = JSON.parse(util.cookie.get());

    self.config = config;

    if (anchorString !== "") {
      newAuth = util.objectify(anchorString);

      if (newAuth.access_token && newAuth.expires_in) {
        self.auth = newAuth;
        util.cookie.set(JSON.stringify(self.auth));
      }
    }
  }
  exports.init = init;
  exports.auth = auth;

  function authenticate(popup) {
    var args = {};
    if (auth === null) {

      if (popup === true) {
      } else {
        args = {'response_type': 'token', 'client_id': self.config.client_id};

        if (self.config.redirect_uri) {
          args.redirect_uri = self.config.redirect_uri;
        }

        window.location = oauthUrl + '?' + util.serialize(args);
      }
    }
  }
  exports.authenticate = authenticate;

  function logged_in() {
    return (self.auth && self.auth.access_token) ? true : false;
  }
  exports.logged_in = logged_in;

  function expire() {
    self.auth = null;
    util.cookie.erase();
  }
  exports.expire = expire;

  function execute(method, path, args, callback) {
    var callbackId = util.guid(),
      message = {};

    if (!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }

    message = {'method': method,
               'path': path,
               'args': args,
               'accessToken': self.auth.access_token,
               'callbackId': callbackId,
               'version': version};
		anonymousCallbacks[callbackId] = callback;
    iframe.contentWindow.postMessage(JSON.stringify(message), receiverUrl);
  }

  function get(path, callback) {
    execute('GET', path, {}, callback);
  }
  exports.get = get;

  function post(path, args, callback) {
    execute('POST', path, args, callback);
  }
  exports.post = post;

  /* Receive the response from the iframe and execute the callback stored in an array (yes, this is how you're supposed to do it) */
  function receive(event) {
    var payload = JSON.parse(event.data);

    if (typeof payload.response === 'string') {
      payload.response = JSON.parse(payload.response);
    }

    if (typeof payload.error === 'string') {
      payload.error = JSON.parse(payload.error);
    }

    anonymousCallbacks[payload.callbackId](payload.response, payload.error);
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

window.onload = function () {
  geoloqi.init();
}

window.addEventListener("message", function(event) {
  geoloqi.receive(event);
});