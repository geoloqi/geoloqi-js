console.log('Start');

var geoloqi = (function (google) {

  //Public Facing Methods
  var geoloqi = {};

  var styles = [];

  //Public Methods for Styles
  geoloqi.styles = {}

  //Add a style that can be reused later
  geoloqi.styles.add = function(options){

  };

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

  //Namespace for pins
  geoloqi.pins = {};

  /*
    Basic Pin
  */
  geoloqi.pins.Basic = function(options){

    var object = function(){
      this.lat = options.lat;
      this.lng = options.lng;
      console.log('');
      console.log('Pin Created');
    };

    object.prototype = {
      getLatLng: function(){
        console.log(this.lat + ", " + this.lng);
      },
      movePin: function(lat,lng){
        this.lat = lat;
        this.lng = lng;
      }
    }

    return new object();
  };

  /*
    A Pin With A Radius
  */
  geoloqi.pins.WithRadius = function(options) {

    var object = function(){
      this.radius = options.radius;

      this.getRadius = function(){
        console.log(this.radius);
      };
    };

    object.prototype = new geoloqi.pins.Basic(options);

    return new object();
  };

  /*
    A Pin With An Infobox
  */
  geoloqi.pins.WithInfobox = function(options) {

    var object = function(){
      this.infobox = options.infobox;
      this.getInfobox = function(){
        console.log(this.infobox);
      };
    };

    object.prototype = new geoloqi.pins.Basic(options);

    return new object();

  };

  /*
    A Pin With an Infobox and a Radius
  */
  geoloqi.pins.WithInfoboxAndRadius = function(options) {

    var object = function(){
      this.someVar = "Test";
      this.someFunc = function(argument) {
        console.log("Woot");
      };
    };

    object.prototype = util.merge(new geoloqi.pins.WithRadius(options), new geoloqi.pins.WithInfobox(options));

    return new object();
  };

  return geoloqi;

}(google));

/* Test a Pin */
var pin1 = new geoloqi.pins.Basic({
  lat: -122,
  lng: 45
});

pin1.getLatLng();

/* Test a with WithRadius */
var pinRadius1 = new geoloqi.pins.WithRadius({
 lat: 189,
 lng: -34,
 radius: 100
});

pinRadius1.getLatLng();
pinRadius1.getRadius();

/* Test a with WithInfobox */
var pinInfobox1 = new geoloqi.pins.WithInfobox({
  lat: 221,
  lng: -67,
  infobox: "Geonote"
});

pinInfobox1.getLatLng();
pinInfobox1.getInfobox();

/* Test a with WithInfoboxAndRadius */
var pinInfoboxRadius1 = new geoloqi.pins.WithInfoboxAndRadius({
  lat: 184,
  lng: -92  ,
  radius: 100,
  infobox: "YES!"
});

pinInfoboxRadius1.getLatLng();
pinInfoboxRadius1.getRadius();
pinInfoboxRadius1.getInfobox();
pinInfoboxRadius1.someFunc();