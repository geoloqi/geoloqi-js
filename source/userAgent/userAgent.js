if (!Array.prototype.map) {
  Array.prototype.map = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var res = []; res.length = len;
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        res[i] = fun.call(thisp, t[i], i, t);
      }
    }

    return res;
  };
}

window.UserAgent = (function(){

  exports = {};

  regexes = {
    "user_agent_parsers": [
      {
        "regex": "^(Opera)/(\\d+)\\.(\\d+) \\(Nintendo Wii",
        "family_replacement": "Wii"
      },
      {
        "regex": "(SeaMonkey|Fennec|Camino)/(\\d+)\\.(\\d+)\\.?([ab]?\\d+[a-z]*)"
      },
      {
        "regex": "(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?)",
        "family_replacement": "Firefox ($1)"
      },
      {
        "regex": "(Firefox)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)",
        "family_replacement": "Firefox Beta"
      },
      {
        "regex": "(Firefox)-(?:\\d+\\.\\d+)?/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)",
        "family_replacement": "Firefox Beta"
      },
      {
        "regex": "(Namoroka|Shiretoko|Minefield)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?",
        "family_replacement": "Firefox ($1)"
      },
      {
        "regex": "(Firefox).*Tablet browser (\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "MicroB"
      },
      {
        "regex": "(MozillaDeveloperPreview)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)?"
      },
      {
        "regex": "(Flock)/(\\d+)\\.(\\d+)(b\\d+?)"
      },
      {
        "regex": "(RockMelt)/(\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Fennec)/(\\d+)\\.(\\d+)(pre)"
      },
      {
        "regex": "(Navigator)/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Netscape"
      },
      {
        "regex": "(Navigator)/(\\d+)\\.(\\d+)([ab]\\d+)",
        "family_replacement": "Netscape"
      },
      {
        "regex": "(Netscape6)/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Netscape"
      },
      {
        "regex": "(MyIBrow)/(\\d+)\\.(\\d+)",
        "family_replacement": "My Internet Browser"
      },
      {
        "regex": "(Opera Tablet).*Version\\/(\\d+)\\.(\\d+)(?:\\.(\\d+))?"
      },
      {
        "regex": "(Opera)/.+Opera Mobi.+Version/(\\d+)\\.(\\d+)",
        "family_replacement": "Opera Mobile"
      },
      {
        "regex": "(Opera Mini)/(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Opera)/9.80.*Version\\/(\\d+)\\.(\\d+)(?:\\.(\\d+))?"
      },
      {
        "regex": "(webOS)/(\\d+)\\.(\\d+)",
        "family_replacement": "Palm webOS"
      },
      {
        "regex": "(luakit)",
        "family_replacement": "LuaKit"
      },
      {
        "regex": "(Lightning)/(\\d+)\\.(\\d+)([ab]?\\d+[a-z]*)"
      },
      {
        "regex": "(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+(?:pre)?) \\(Swiftfox\\)",
        "family_replacement": "Swiftfox"
      },
      {
        "regex": "(Firefox)/(\\d+)\\.(\\d+)([ab]\\d+[a-z]*)? \\(Swiftfox\\)",
        "family_replacement": "Swiftfox"
      },
      {
        "regex": "rekonq",
        "family_replacement": "Rekonq"
      },
      {
        "regex": "(conkeror|Conkeror)/(\\d+)\\.(\\d+)\\.?(\\d+)?",
        "family_replacement": "Conkeror"
      },
      {
        "regex": "(konqueror)/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Konqueror"
      },
      {
        "regex": "(PlayBook).+RIM Tablet OS (\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(WeTab)-Browser"
      },
      {
        "regex": "(wOSBrowser).+TouchPad/(\\d+)\\.(\\d+)",
        "family_replacement": "webOS TouchPad"
      },
      {
        "regex": "(Comodo_Dragon)/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Comodo Dragon"
      },
      {
        "regex": "(YottaaMonitor)"
      },
      {
        "regex": "(Kindle)/(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(AdobeAIR|Chromium|FireWeb|Jasmine|ANTGalio|Midori|Fresco|Lobo|PaleMoon|Maxthon|Lynx|OmniWeb|Dillo|Camino|Demeter|Fluid|Fennec|Shiira|Sunrise|Chrome|Flock|Netscape|Lunascape|Epiphany|WebPilot|Vodafone|NetFront|Konqueror|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|Opera Mini|iCab|NetNewsWire|ThunderBrowse|Iron|Iris)/(\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Bolt|Jasmine|IEMobile|IceCat|Skyfire|Midori|Maxthon|Lynx|Arora|IBrowse|Dillo|Camino|Shiira|Fennec|Phoenix|Chrome|Flock|Netscape|Lunascape|Epiphany|WebPilot|Opera Mini|Opera|Vodafone|NetFront|Konqueror|Googlebot|SeaMonkey|Kazehakase|Vienna|Iceape|Iceweasel|IceWeasel|Iron|K-Meleon|Sleipnir|Galeon|GranParadiso|iCab|NetNewsWire|Iron|Space Bison|Stainless|Orca|Dolfin|BOLT)/(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(iRider|Crazy Browser|SkipStone|iCab|Lunascape|Sleipnir|Maemo Browser) (\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(iCab|Lunascape|Opera|Android) (\\d+)\\.(\\d+)\\.?(\\d+)?"
      },
      {
        "regex": "(IEMobile) (\\d+)\\.(\\d+)",
        "family_replacement": "IE Mobile"
      },
      {
        "regex": "(Firefox)/(\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Firefox)/(\\d+)\\.(\\d+)(pre|[ab]\\d+[a-z]*)?"
      },
      {
        "regex": "(Obigo|OBIGO)[^\\d]*(\\d+)(?:.(\\d+))?",
        "family_replacement": "Obigo"
      },
      {
        "regex": "(MAXTHON|Maxthon) (\\d+)\\.(\\d+)",
        "family_replacement": "Maxthon"
      },
      {
        "regex": "(Maxthon|MyIE2|Uzbl|Shiira)",
        "major_version_replacement": "0"
      },
      {
        "regex": "(PLAYSTATION) (\\d+)",
        "family_replacement": "PlayStation"
      },
      {
        "regex": "(PlayStation Portable)[^\\d]+(\\d+).(\\d+)"
      },
      {
        "regex": "(BrowseX) \\((\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(POLARIS)/(\\d+)\\.(\\d+)",
        "family_replacement": "Polaris"
      },
      {
        "regex": "(BonEcho)/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Bon Echo"
      },
      {
        "regex": "(iPod).+Version/(\\d+)\\.(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(iPhone) OS (\\d+)_(\\d+)(?:_(\\d+))?"
      },
      {
        "regex": "(iPad).+ OS (\\d+)_(\\d+)(?:_(\\d+))?"
      },
      {
        "regex": "(Avant)",
        "major_version_replacement": "1"
      },
      {
        "regex": "(Nokia)[EN]?(\\d+)"
      },
      {
        "regex": "(Black[bB]erry).+Version\\/(\\d+)\\.(\\d+)\\.(\\d+)",
        "family_replacement": "Blackberry"
      },
      {
        "regex": "(Black[bB]erry)\\s?(\\d+)",
        "family_replacement": "Blackberry"
      },
      {
        "regex": "(OmniWeb)/v(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Blazer)/(\\d+)\\.(\\d+)",
        "family_replacement": "Palm Blazer"
      },
      {
        "regex": "(Pre)/(\\d+)\\.(\\d+)",
        "family_replacement": "Palm Pre"
      },
      {
        "regex": "(Links) \\((\\d+)\\.(\\d+)"
      },
      {
        "regex": "(QtWeb) Internet Browser/(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(Version)/(\\d+)\\.(\\d+)(?:\\.(\\d+))?.*Safari/",
        "family_replacement": "Safari"
      },
      {
        "regex": "(Safari)/\\d+"
      },
      {
        "regex": "(OLPC)/Update(\\d+)\\.(\\d+)"
      },
      {
        "regex": "(OLPC)/Update()\\.(\\d+)",
        "major_version_replacement": "0"
      },
      {
        "regex": "(SamsungSGHi560)",
        "family_replacement": "Samsung SGHi560"
      },
      {
        "regex": "^(SonyEricssonK800i)",
        "family_replacement": "Sony Ericsson K800i"
      },
      {
        "regex": "(Teleca Q7)"
      },
      {
        "regex": "(MSIE) (\\d+)\\.(\\d+)",
        "family_replacement": "IE"
      }
    ],
    "os_parsers": [
      {
        "regex": "(Android)"
      },
      {
        "regex": "(Windows)"
      },
      {
        "regex": "(iPad)"
      },
      {
        "regex": "(iPhone OS) ([\\d_]+)",
        "os_replacement": "iOS"
      },
      {
        "regex": "(Mac OS X)"
      },
      {
        "regex": "(FreeBSD)"
      },
      {
        "regex": "(iPod)"
      },
      {
        "regex": "(iPhone Simulator)"
      },
      {
        "regex": "(Linux)"
      }
    ],
    "product_parsers": [
      {
        "regex": "(iPhone)"
      }
    ]
  };
  
  var ua_parsers = regexes.user_agent_parsers.map(function(obj) {
    var regexp = new RegExp(obj.regex),
        famRep = obj.family_replacement,
        majorVersionRep = obj.major_version_replacement;

    function parser(ua) {
      var m = ua.match(regexp);
      
      if (!m) { return null; }
      
      var family = famRep ? famRep.replace('$1', m[1]) : m[1];
      
      var obj = new UserAgent(family);
      obj.major = parseInt(majorVersionRep ? majorVersionRep : m[2]);
      obj.minor = m[3] ? parseInt(m[3]) : null;
      obj.patch = m[4] ? parseInt(m[4]) : null;
      
      return obj;
    }
    
    return parser;
  });

  var os_parsers = regexes.os_parsers.map(function(obj) {
    var regexp = new RegExp(obj.regex),
        osRep  = obj.os_replacement;

    function parser(ua) {
      var m = ua.match(regexp);

      if(!m) { return null; }

      var os = (osRep ? osRep : m[1]) + (m.length > 2 ? " " + m[2] : "");

      return os;
    }

    return parser;
  });

  exports.parse = parse;
  function parse(ua) {
    var os, i;
    for (i=0; i < ua_parsers.length; i++) {
      var result = ua_parsers[i](ua);
      if (result) { break; }
    }

    for (i=0; i < os_parsers.length; i++) {
      os = os_parsers[i](ua);
      if (os) { break; }
    }

    if(!result) { result = new UserAgent(); }

    result.os = os;
    return result;
  }

  function UserAgent(family) {
    this.family = family || 'Other';
  }

  UserAgent.prototype.toVersionString = function() {
    var output = '';
    if (this.major != null) {
      output += this.major;
      if (this.minor != null) {
        output += '.' + this.minor;
        if (this.patch != null) {
          output += '.' + this.patch;
        }
      }
    }
    return output;
  };

  UserAgent.prototype.toString = function() {
    var suffix = this.toVersionString();
    if (suffix) { suffix = ' ' + suffix; }
    return this.family + suffix;
  };

  UserAgent.prototype.toFullString = function() {
    return this.toString() + (this.os ? "/" + this.os : "");
  };

  return exports;
})();