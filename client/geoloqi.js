window.onload = function() {
  geoloqi.init();
}

window.addEventListener("message", function(event) {
  geoloqi.receive(event);
});

var geoloqi = (function () {
  var version = '0.0.1';
	var _anonymousCallbacks = {};
  var self = this;
  var exports = {};
  var receiverUrl = 'https://api.geoloqi.com/receiver.html';
  var oauthUrl = 'https://geoloqi.com/oauth/authorize';
  var geoloqiRootId = 'geoloqi-root';
  var iframe = null;
  var cookieName = '_geoloqi_auth';

  var config = {};
  exports.config = config;

  var auth = null;

  function init(config) {
    var iframeContainer = document.getElementById('geoloqi-root');
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", receiverUrl);
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "0px";
    iframeContainer.appendChild(iframe);
    self.auth = JSON.parse(util.cookie.get());

    self.config = config;

    var anchorString = document.location.hash.substring(1);

    if(anchorString !== "") {
      var newAuth = util.objectify(anchorString);

      if(newAuth.access_token && newAuth.expires_in) {
        self.auth = newAuth;
        util.cookie.set(JSON.stringify(self.auth));
      }
    }
  }
  exports.init = init;
  exports.auth = auth;

  function authenticate(popup) {
    if(auth === null) {
      var popup = false;
      if(popup == true) {
      } else {
        var args = {'response_type': 'token', 'client_id': self.config.client_id};

        if(self.config.redirect_uri) {
          args['redirect_uri'] = self.config.redirect_uri;
        }

        window.location = oauthUrl+'?'+util.serialize(args);
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

  function get(path, callback) {
    execute('GET', path, {}, callback);
  }
  exports.get = get;

  function post(path, args, callback) {
    execute('POST', path, args, callback);
  }
  exports.post = post;

  function execute(method, path, args, callback) {
    if(!logged_in()) {
      throw "Not logged in, no access_token is present. Authorize the user with geoloqi.authorize() first.";
    }
    var callbackId = util.guid();
		var arguments = {'method': method,
										 'path': path,
										 'args': args,
										 'accessToken': self.auth.access_token,
										 'callbackId': callbackId,
										 'version': version};
		_anonymousCallbacks[callbackId] = callback;
    iframe.contentWindow.postMessage(JSON.stringify(arguments), receiverUrl);
  }

  /* Receive the response from the iframe and execute the callback stored in an array (yes, this is how you're supposed to do it) */
  function receive(event) {
    var payload = JSON.parse(event.data);
    _anonymousCallbacks[payload.callbackId](payload.response, payload.error);
  }
  exports.receive = receive;

  var util = {};

  util.serialize = function(obj) {
    var str = [];
    for(var p in obj)
       str.push(p + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
  }

  util.objectify = function(queryString) {
    var result = {};
    var re = /([^&=]+)=([^&]*)/g;
    var m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
  }

  util.cookie = (function() {
//    var self = this;
    var exports = {};

    function set(value, secondsUntilExpire) {
      if (secondsUntilExpire) {
        var date = new Date();
        date.setTime(date.getTime()+(secondsUntilExpire*1000));
        var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = cookieName+"="+value+expires+"; path=/";
    }
    exports.set = set;

    function get() {
      var nameEQ = cookieName + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
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

	util.guid = function() {
		return 'g' + (Math.random() * (1<<30)).toString(16).replace('.', '');
	}

  return exports;
}());