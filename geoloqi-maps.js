//Make Google Maps Optional
if(typeof google == 'undefined'){
  var google = null;
};

var geoloqi = ( function (google) {

  //@TODO geoloqi.maps should be wrapped in an if statement so google maps is optional

  //Public Facing Object
  var geoloqi = {},

  //Private Utility Helpers
  util = {};

  util.merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  // addMethod - By John Resig (MIT Licensed)
  util.addMethod = function (object, name, fn){
    var old = object[ name ];
    object[ name ] = function(){
      if ( fn.length == arguments.length )
        return fn.apply( this, arguments );
      else if ( typeof old == 'function' )
        return old.apply( this, arguments );
    };
  }

if(google){ //Everything in here requires google maps

  geoloqi.maps = {};

  //Sets the default map everything should reference
  geoloqi.maps.init = function(newMap){
    if(map instanceof google.maps.Map){
      defaults.map = newMap;
      defaults.pin.map = newMap;
      defaults.line.map = newMap;
      defaults.handle.map = newMap;
    }
  };

  geoloqi.maps.getMap = function(){
    return defaults.map;
  };

  //Public Methods for Styles
  geoloqi.maps.styles = {};

  //Add a style that can be reused later
  geoloqi.maps.styles.define = function(name, style){
    geoloqi.maps.styles[name] = util.merge(geoloqi.maps.styles['default'], style);
  };

  //Set a new default style
  geoloqi.maps.styles.setDefault = function(name){
    geoloqi.maps.styles.default = geoloqi.maps.styles[name];
  };

  geoloqi.maps.styles.default = {
    marker:{},
    circles: {
      count: 1,
      color: "#CE7F2C",
      opacity: 0.4,
      stroke: {
        color: "#CE7F2C",
        weight: 2,
        opacity: 0.6
      }
    },
    handle: {},
    line: {
      color: "#000",
      weight: 2,
      opacity: 0.8
    },
    info: {
      useInfobox: false
    }
  };

  var defaults = {
    map: null,
    pin: {
      style: 'default',
      map: null,
      visible:true,
      clickable: false,
      draggable: true,
      editable: true,
      radius: 100,
      autopan: false
    },
    line: {
      clickable: false,
      strokeColor: geoloqi.maps.styles['default'].line.color,
      strokeOpacity: geoloqi.maps.styles['default'].line.opacity,
      strokeWeight: geoloqi.maps.styles['default'].line.weight,
      map: null
    },
    handle: {
      icon: geoloqi.maps.styles['default'].handle.icon,
      shadow: geoloqi.maps.styles['default'].handle.shadow,
      map: null,
      draggable: true,
      raiseOnDrag: false,
      clickable: false,
      visible: true
    },
    info: {
      useInfobox: false
    }
  };

  //Public Helper Methods
  geoloqi.maps.helpers = {};

  //Zoom and center map to a radius
  geoloqi.maps.helpers.fitMapToRadius = function (center, radius) {
    var bounds = new google.maps.LatLngBounds();
    var geo = google.maps.geometry.spherical;
    bounds.extend(geo.computeOffset(center, radius, 0));
    bounds.extend(geo.computeOffset(center, radius, 180));
    bounds.extend(geo.computeOffset(center, radius, 270));
    bounds.extend(geo.computeOffset(center, radius, 90));
    defaults.map.fitBounds(bounds);
  };

  //Returns the ideal radius for a map
  geoloqi.maps.helpers.getIdealRadiusForMap = function(){
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var se = new google.maps.LatLng(sw.lat(), ne.lng());
    return (google.maps.geometry.spherical.computeDistanceBetween(ne, se) / 4);
  }

  //Namespace for pins
  geoloqi.maps.pins = {};

  //Basic Pin
  geoloqi.maps.pins.Basic = function(opts, init){

    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      console.log("defaults.pin");
      console.log(defaults.pin);

      this.options = util.merge(defaults.pin, opts);
      this.style = geoloqi.maps.styles[this.options.style];

      console.log("this.options");
      console.log(this.options);

      this.options.icon = this.style.marker.icon;
      this.options.shadow = this.style.marker.shadow;
      this.options.position = new google.maps.LatLng(this.options.lat, this.options.lng);

      (init) ? this.initPin() : '';
    };

    object.prototype = {

      showOnMap: function(){
        this.marker.setMap(defaults.map);
      },

      removeFromMap: function() {
        this.marker.setMap(null);
      },

      getPosition: function(){
        return this.marker.getPosition();
      },

      moveTo: function(latLng){
        this.marker.setPosition(latLng);
      },

      setPosition: function(latLng){
        this.marker.setPosition(latLng);
      },

      initPin: function() {
        var self = this;

        this.marker = new google.maps.Marker(this.options);

        google.maps.event.addListener(this.marker, "dragend", function(event) {

          if(self.options.autopan){
            map.panTo(self.getPosition());
          };

        });

      }

    };

    return new object();
  };

  //A Pin With A Radius
  geoloqi.maps.pins.WithRadius = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      // Properties
      // ==========
      this.options = util.merge(defaults.pin, opts);
      this.style = geoloqi.maps.styles[this.options.style];

      this.handleOptions = util.merge(defaults.handle, this.style.handle);
      this.handleOptions.position = new google.maps.LatLng(this.options.lat, this.options.lng);

      this.lineOptions = util.merge(defaults.line, this.style.line);

      // Methods
      // =======
      this.hideCircles = function(){
        if(this.circles.length > 0){
          for(var i = 0; i<this.circles.length; i++) {
            this.circles[i].circle.setMap(null);
          }
        }
      };

      this.showCircles = function(){
        if(this.circles.length > 0){
          for(var i = 0; i<this.circles.length; i++) {
            this.circles[i].circle.setMap(defaults.map);
          }
        }
      };

      this.showOnMap = function(){
        this.showCircles();
        this.line.setMap(defaults.map);
        this.handle.setMap(defaults.map);
        this.marker.setMap(defaults.map);
      };

      this.removeFromMap = function() {
        this.hideCircles();
        this.line.setMap(null);
        this.handle.setMap(null);
        this.marker.setMap(null);
      };

      //  Get the Radius of the outermost circle
      this.getRadius = function(){
        return this.circles[0].circle.getRadius();
      };

      // Setup Circles
      this.setupCircles = function(radius, visible){
        radius = typeof(radius) != 'undefined' ? radius : this.radius; //default to this.radius

        if (typeof(visible) == 'undefined'){
          visible = typeof(this.marker.getMap()) == "object" ? true : false;
        }

       this.hideCircles();

        this.circles = [];

        for(var i = 0; i<this.style.circles.count; i++) {
          this.circles.push({
            circle: new google.maps.Circle({
              center: this.getPosition(),
              radius: radius - (i*3),
              fillColor: this.style.circles.color,
              fillOpacity: this.style.circles.opacity,
              strokeColor: this.style.circles.stroke.color,
              strokeWeight: this.style.circles.stroke.weight,
              strokeOpacity: this.style.circles.stroke.opacity,
              map: (visible) ? defaults.map : null
            }),
            index: i
          });
          this.circles[i].circle.bindTo('center', this.marker, 'position');
        }
      };

      this.updateHandle = function(){
        this.handle.setPosition(google.maps.geometry.spherical.computeOffset(this.marker.getPosition(), this.getRadius(), 135));
      }

      this.updateLine = function(){
        this.line.setPath([this.getPosition(), this.handle.getPosition()]);
      }

      this.hideHandle = function() {
       this.line.setMap(null);
       this.handle.setMap(null);
      }

      this.showHandle = function() {
       this.line.setMap(defaults.map);
       this.handle.setMap(defaults.map);
      }

      this.lockPin = function(){
        this.marker.setDraggable(false);
        this.hideHandle();
      }

      this.unlockPin = function() {
        this.marker.setDraggable(true);
        this.showHandle();
      }

      this.initRadius = function(){
        var self = this;
        this.handle = new google.maps.Marker(this.handleOptions);
        this.line = new google.maps.Polyline(this.lineOptions);
        this.circles = [];

        //Setup Circles
        this.setupCircles(this.options.radius);

        //Setup The Handle Position and Line
        this.updateHandle();
        this.updateLine();

        //Update the handle and line when the marker is moved
        google.maps.event.addListener(this.marker, "position_changed", function(event) {
          self.updateHandle();
          self.updateLine();
        });

        // Update the position of the handle when the center is dragged
        google.maps.event.addListener(this.marker, "dragstart", function(event) {
          self.hideHandle();
          // handleHeading = google.maps.geometry.spherical.computeHeading(placeMarker.getPosition(), placeMarkerHandle.getPosition());
        });

        // Update the position of the handle when the center is dragged
        google.maps.event.addListener(this.marker, "drag", function(event) {
          self.updateHandle();
        });

        // Center map on the pin, show info, handle and Line
        google.maps.event.addListener(this.marker, "dragend", function(event) {
          if(!self.options.autopan){
            self.showHandle();
          }
        });

        google.maps.event.addListener(defaults.map, 'idle', function(event){
          if(self.options.autopan){
            self.showHandle();
          }
        });

        //Update Radius on handle drag
        google.maps.event.addListener(this.handle, "drag", function(event) {

          var G = google.maps.geometry.spherical;

          var A = self.getPosition();
          var B = event.latLng;

          var radians = function(degrees) { return degrees * (Math.PI/180); };

          // Compute the angle from A to B
          var beta = G.computeHeading(A, B);

          // The angle of the second triangle is 45 degrees plus the previous angle
          var gamma = 45 + beta;

          // The radius of the circle is cos(gamma) * distance from A to B
          var x = G.computeDistanceBetween(A, B);
          newRadius = -1 * (Math.cos(radians(gamma)) * x);

          self.handle.setPosition(G.computeOffset(A, newRadius, 135));

          self.updateLine();

          for(var i = 0; i<self.style.circles.count; i++) {
            self.circles[i].circle.setRadius(newRadius - (i*3));
          }
        });

        google.maps.event.addListener(this.handle, "dragend", function(event) {
          var bounds = defaults.map.getBounds();
          console.log(bounds.contains(self.handle.getPosition()));
          if(!bounds.contains(self.handle.getPosition())){
            geoloqi.maps.helpers.fitMapToRadius(self.marker.getPosition(), self.getRadius());
          }
        });

      };

      // Init
      // ====
      (init) ? this.initRadius() : '';
    };

    (inherit) ? object.prototype = new geoloqi.maps.pins.Basic(opts) : '';

    return new object();
  };

  //A Pin With An Infobox
  geoloqi.maps.pins.WithInfobox = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      this.options = util.merge(defaults.pin, opts);
      this.style = geoloqi.maps.styles[this.options.style];
      this.infoOptions = util.merge(util.merge(defaults.info, opts), this.style.info);

      this.removeFromMap = function(){
        this.info.close();
        this.marker.setMap(null);
      };

      this.showOnMap = function(){
        this.info.open(defaults.map, this.marker);
        this.marker.setMap(defaults.map);
      };

      this.hideInfobox = function() {
        if(typeof Infobox != "undefined"){
          if(this.info instanceof Infobox){
            this.info.hide();
          }
        } else {
          this.info.close(defaults.map, this.marker);
        }
      };

      this.showInfobox = function() {
        if(typeof Infobox != "undefined"){
          if(this.info instanceof Infobox){
            this.info.show();
          }
        } else {
          this.info.open(defaults.map, this.marker);
        }
      };

      this.setContent = function(html) {
        this.info.setContent(html);
      };

      this.initInfobox = function(){
        var self = this;

        //@TODO isClickable
        //@TODO click to toggle info

        if(this.infoOptions.useInfobox){
          this.info = new InfoBox(this.infoOptions);
        } else {
          this.info = new google.maps.InfoWindow(this.infoOptions);
        }

        google.maps.event.addListener(this.marker, "dragstart", function(event) {
          self.hideInfobox();
        });

        google.maps.event.addListener(this.marker, "dragend", function(event) {
          if(!self.options.autopan){
            self.showInfobox();
          }
        });

        google.maps.event.addListener(defaults.map, 'idle', function(event){
          if(self.options.autopan){
            self.showInfobox();
          }
        });

        this.info.open(defaults.map, this.marker);

      };

      (init) ? this.initInfobox() : ''

    };

    (inherit) ? object.prototype = new geoloqi.maps.pins.Basic(opts) : ''

    return new object();
  };

  //A Pin With an Infobox and a Radius
  geoloqi.maps.pins.WithInfoboxAndRadius = function(opts, init, prototype) {

    prototype = (typeof prototype != "undefined") ? prototype : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      this.removeFromMap = function() {
        this.marker.setMap(null);
        this.handle.setMap(null);
        this.line.setMap(null);
        this.hideCircles();
      };

      this.showOnMap = function() {
        this.marker.setMap(defaults.map);
        this.handle.setMap(defaults.map);
        this.line.setMap(defaults.map);
        this.hideCircles();
      };

      this.initInfoboxAndRadius = function() {
        var self = this;

        google.maps.event.addListener(this.handle, "dragstart", function(event) {
          self.hideInfobox();
        });

        google.maps.event.addListener(this.handle, "dragend", function(event) {
          self.showInfobox();
        });
      }

      if(init){
        this.initRadius();
        this.initInfobox();
        this.initInfoboxAndRadius();
      }

    };

    object.prototype = util.merge(new geoloqi.maps.pins.WithRadius(opts, false, true), new geoloqi.maps.pins.WithInfobox(opts, false, false));

    return new object();
  };
}; //End Google Maps
  return geoloqi;

}(google));

//@TODO Make sure google exists before passing it in