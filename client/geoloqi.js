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

  var auth = null;
  exports.auth = auth;

  function init() {
    var iframeContainer = document.getElementById('geoloqi-root');
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", receiverUrl);
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "0px";
    iframeContainer.appendChild(iframe);
    exports.auth = JSON.parse(util.cookie.get());

    var anchorString = document.location.hash.substring(1);

    if(anchorString !== "") {
      var newAuth = util.objectify(anchorString);

      if(newAuth.access_token && newAuth.expires_in) {
        exports.auth = newAuth;
        util.cookie.set(JSON.stringify(exports.auth));
      }
    }
  }
  exports.init = init;

  var config = {};
  exports.config = config;

  function authenticate(popup) {
    if(auth === null) {
      var popup = false;
      if(popup == true) {
      } else {
        var args = {'response_type': 'token', 'client_id': exports.config.client_id};

        if(exports.config.redirect_uri) {
          args['redirect_uri'] = exports.config.redirect_uri;
        }

        window.location = oauthUrl+'?'+util.serialize(args);
      }
    }
  }
  exports.authenticate = authenticate;

  function get(path, callback) {
    execute('GET', path, {}, callback);
  }
  exports.get = get;

  function post(path, args, callback) {
    execute('POST', path, args, callback);
  }
  exports.post = post;

  function execute(method, path, args, callback) {
    var callbackId = util.guid();
		var arguments = {'method': method,
										 'path': path,
										 'args': args,
										 'accessToken': exports.auth.access_token,
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
      create("",-1);
    }
    exports.erase = erase;

    return exports;
  }());

	util.guid = function() {
		return 'g' + (Math.random() * (1<<30)).toString(16).replace('.', '');
	}

  return exports;
}());