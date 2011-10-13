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
  var oauthUrl = 'https://api.geoloqi.com/1/oauth/authorize';
  var geoloqiRootId = 'geoloqi-root';
  var iframe = null;

  function init() {
    var iframeContainer = document.getElementById('geoloqi-root');
    iframe = document.createElement("iframe");
    iframe.setAttribute("src", receiverUrl);
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "0px";
    iframeContainer.appendChild(iframe);
  }
  exports.init = init;

  function config() {
    
  }

  function auth(popup) {
    var popup = false;
    if(popup == true) {
    } else {
      window.location = oauthUrl;
    }
    
    util.cookies.create('_geoloqi_auth', JSON.stringify({'access_token': 'FJQbwq9', 'expires_in': 3600}), 1);
    // util.cookies.erase('_geoloqi_auth');
    console.log(util.cookies.read('_geoloqi_auth'));
    if(util.cookies.read('_geoloqi_auth')) {
      
    }
  }
  exports.auth = auth;

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
										 'accessToken': geoloqi.accessToken,
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
    if (!isObject(obj)) return obj;
    var pairs = [];
    for (var key in obj) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
    return pairs.join('&');
  }

  util.getQuery = function() {
    var result = {}, queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;

    while (m = re.exec(queryString)) {
      result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
  }

  util.cookies = (function() {
    var exports = {};

    function create(name, value, secondsUntilExpire) {
      if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(secondsUntilExpire*1000));
        var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = name+"="+value+expires+"; path=/";
    }
    exports.create = create;

    function read(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
	      var c = ca[i];
	      while (c.charAt(0)==' ') c = c.substring(1,c.length);
	      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    }
    exports.read = read;

    function erase(name) {
      create(name,"",-1);
    }
    exports.erase = erase;

    return exports;
  }());

	util.guid = function() {
		return 'g' + (Math.random() * (1<<30)).toString(16).replace('.', '');
	}

  return exports;
}());