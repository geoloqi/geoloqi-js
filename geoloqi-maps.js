if(typeof geoloqi === 'undefined') {
  var geoloqi = {};
}

geoloqi.maps = (function() {

  //Public Facing Object
  var exports = {},
      util = {};

  util.merge = function(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  //Sets the default map everything should reference
  exports.setDefault = function(newMap){
    if(map instanceof google.maps.Map){
      defaults.map = newMap;
      defaults.pin.map = newMap;
      defaults.line.map = newMap;
      defaults.handle.map = newMap;
    }
  };

  exports.getMap = function(){
    return defaults.map;
  };

  //Public Methods for Styles
  exports.styles = {};

  //Add a style that can be reused later
  exports.styles.define = function(name, style, makeDefault){
    makeDefault = (typeof makeDefault == "undefined") ? false : makeDefault;

    exports.styles[name] = util.merge(exports.styles['default'], style);

    if(makeDefault){
      exports.styles.setDefault(name);
    }
  };

  //Set a new default style
  exports.styles.setDefault = function(name){
    exports.styles.default = exports.styles[name];
  };

  exports.styles.default = {
    marker:{},
    circles: {
      count: 1,
      fillColor: "#CE7F2C",
      fillOpacity: 0.2,
      strokeColor: "#CE7F2C",
      strokeWeight: 2,
      strokeOpacity: 0.6
    },
    handle: {},
    line: {
      strokeColor: "#000",
      strokeWeight: 2,
      strokeOpacity: 0.6
    },
    info: {
      useInfobox: false
    }
  };

  exports.styles.geoloqi_js = exports.styles.default;

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
      autopan: false,
      toggleInfobox: false
    },
    line: {
      clickable: false,
      map: null
    },
    handle: {
      icon: exports.styles['default'].handle.icon,
      shadow: exports.styles['default'].handle.shadow,
      map: null,
      draggable: true,
      raiseOnDrag: false,
      clickable: false,
      visible: true
    },
    info: {
      useInfobox: false,
      opened: false,
      toggleInfoOnClick: true,
      openAfterDrag: true
    }
  };

  //Public Helper Methods
  exports.helpers = {};

  //Zoom and center map to a radius
  exports.helpers.fitMapToRadius = function (center, radius) {
    var bounds = new google.maps.LatLngBounds();
    var geo = google.maps.geometry.spherical;
    bounds.extend(geo.computeOffset(center, radius, 0));
    bounds.extend(geo.computeOffset(center, radius, 180));
    bounds.extend(geo.computeOffset(center, radius, 270));
    bounds.extend(geo.computeOffset(center, radius, 90));
    defaults.map.fitBounds(bounds);
  };

  //Returns the ideal radius for a map
  exports.helpers.getIdealRadiusForMap = function(){
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var se = new google.maps.LatLng(sw.lat(), ne.lng());
    return (google.maps.geometry.spherical.computeDistanceBetween(ne, se) / 4);
  }

  //Namespace for pins
  exports.pins = {};

  //Basic Pin
  exports.pins.Basic = function(opts, init){

    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      this.options = util.merge(defaults.pin, opts);
      this.style = exports.styles[this.options.style];

      this.options.icon = this.style.marker.icon;
      this.options.shadow = this.style.marker.shadow;
      
      if(this.options.position instanceof google.maps.LatLng === false){
        this.options.position = new google.maps.LatLng(this.options.position.latitude, this.options.position.longitude);
      }

      if(this.options.editable){
        opts.draggable = true;
      } else {
        opts.draggable = false;
      }

      (init) ? this.initPin() : '';
    };

    object.prototype = {

      centerHere: function(){
        var mapToPan = this.getMap();
        mapToPan.panTo(this.getPosition());
        return this;
      },

      showOnMap: function(map){
        map = (typeof map != "undefined") ? map : defaults.map;
        this.marker.setVisible(true);
        this.marker.setMap(map);
        return this;
      },

      removeFromMap: function() {
        this.marker.setMap(null);
        return this;
      },

      setDraggable: function(state){
        this.marker.setDraggable(state);
        return this;
      },

      getDraggable: function() {
        return this.marker.getDraggable();
      },

      toggleDraggable: function(){
        if(this.getDraggable()){
          this.setDraggable(false);
        } else {
          this.setDraggable(true);
        }
        return this;
      },

      getMap: function(){
        return this.marker.getMap();
      },

      moveTo: function(position, autopan){
        autopan = (typeof autopan == "undefined") ? false : autopan;
        
        if(position instanceof google.maps.LatLng === false){
          position = new google.maps.LatLng(position.latitude, position.longitude);
        }
        
        this.setPosition(latLng);

        if(autopan){
          this.centerHere();
        }

        return this;
      },

      setPosition: function(position){

        if(position instanceof google.maps.LatLng === false){
          position = new google.maps.LatLng(position.latitude, position.longitude);
        }

        this.marker.setPosition(position);
        return this;
      },

      getPosition: function(){
        return this.marker.getPosition();
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
  exports.pins.WithRadius = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      // Properties
      // ==========
      this.options = util.merge(defaults.pin, opts);
      this.style = exports.styles[this.options.style];
      
      this.handleOptions = util.merge(defaults.handle, this.style.handle);
      this.handleOptions.position = new google.maps.LatLng(0,0);
      this.handleOptions.map = this.options.map;

      this.lineOptions = util.merge(defaults.line, this.style.line);
      this.lineOptions.map = this.options.map;

      // Methods
      // =======
      this.hideCircles = function(){
        if(this.circles.length > 0){
          for(var i = 0; i<this.circles.length; i++) {
            this.circles[i].circle.setMap(null);
          }
        }
        return this;
      }

      this.showCircles = function(){
        if(this.circles.length > 0){
          for(var i = 0; i<this.circles.length; i++) {
            this.circles[i].circle.setMap(this.getMap());
          }
        }
        return this;
      }

      this.showOnMap = function(map){
        newMap = (typeof map != "undefined") ? map : defaults.map;
        this.line.setMap(newMap);
        this.handle.setMap(newMap);
        this.marker.setMap(newMap);
        this.showCircles();
        return this;
      }

      this.removeFromMap = function() {
        this.hideCircles();
        this.line.setMap(null);
        this.handle.setMap(null);
        this.marker.setMap(null);
        return this;
      }

      //  Get the Radius of the outermost circle
      this.getRadius = function(){
        return this.circles[0].circle.getRadius();
      }

      // Setup Circles
      this.setupCircles = function(radius, showOnMap){
        radius = typeof(radius) != 'undefined' ? radius : this.radius; //default to this.radius
        showOnMap = (typeof showOnMap != "undefined") ?  showOnMap : null;

        this.hideCircles();

        this.circles = [];

        for(var i = 0; i<this.style.circles.count; i++) {
          
          
          this.circles.push({
            circle: new google.maps.Circle({
              center: this.getPosition(),
              radius: radius - (i*3),
              fillColor: this.style.circles.fillColor,
              fillOpacity: this.style.circles.fillOpacity,
              strokeColor: this.style.circles.strokeColor,
              strokeWeight: this.style.circles.strokeWeight,
              strokeOpacity: this.style.circles.strokeOpacity,
              map: showOnMap,
              zIndex: -1
            }),
            index: i
          });
          this.circles[i].circle.bindTo('center', this.marker, 'position');
        }
        return this;
      };

      this.updateHandle = function(){
        this.handle.setPosition(google.maps.geometry.spherical.computeOffset(this.marker.getPosition(), this.getRadius(), 135));
        return this;
      }

      this.updateLine = function(){
        this.line.setPath([this.getPosition(), this.handle.getPosition()]);
        return this;
      }

      this.hideHandle = function() {
        this.line.setMap(null);
        this.handle.setMap(null);
        return this;
      }

      this.showHandle = function() {
        this.line.setMap(this.getMap());
        this.handle.setMap(this.getMap());
        return this;
      }

      this.lockPin = function(){
        this.setDraggable(false)
        this.hideHandle();
        this.isLocked = true;
        return this;
      }

      this.unlockPin = function() {
        this.marker.setDraggable(true);
        if(this.getMap()){
          this.showHandle();
        }
        this.isLocked = false;
        return this;
      }

      this.toggleLock = function() {
        if(this.isLocked){
          this.unlockPin();
        } else {
          this.lockPin();
        }
        return this;
      }

      this.initRadius = function(){
        var self = this;
        this.line = new google.maps.Polyline(this.lineOptions);
        this.handle = new google.maps.Marker(this.handleOptions);
        this.circles = [];

        this.options.draggable = this.options.editable;

        if(this.options.editable){
          this.unlockPin();
        } else {
          this.lockPin();
        };

        //Setup Circles
        this.setupCircles(this.options.radius, this.options.map);

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

        this.delayedHandle = false;

        if(self.options.autopan){
          google.maps.event.addListener(defaults.map, 'idle', function(event){
            if(!self.isLocked && self.delayedHandle){
              self.showHandle();
            }
            self.delayedHandle = true;
          });
        } else {
          google.maps.event.addListener(this.marker, "dragend", function(event) {
            if(!self.isLocked && self.delayedHandle){
              self.showHandle();
            }
            self.delayedHandle = true;
          });
        }

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
          if(!bounds.contains(self.handle.getPosition())){
            exports.helpers.fitMapToRadius(self.marker.getPosition(), self.getRadius());
          }
        });

      };

      // Init
      // ====
      (init) ? this.initRadius() : '';
    };

    (inherit) ? object.prototype = new exports.pins.Basic(opts) : '';

    return new object();
  };

  //A Pin With An Infobox
  exports.pins.WithInfobox = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){

      this.options = util.merge(defaults.pin, opts);
      this.style = exports.styles[this.options.style];
      this.infoOptions = util.merge(util.merge(defaults.info, this.style.info), opts);

      this.removeFromMap = function(){
        this.info.close();
        this.marker.setMap(null);
        return this;
      };

      this.showOnMap = function(map){
        map = (typeof map != "undefined") ? map : defaults.map;
        this.info.open(map, this.marker);
        this.marker.setMap(map);
        return this;
      };

      this.hideInfo = function() {
        this.opened = false;
        this.info.close();
        return this;
      };

      this.showInfo = function() {
        this.opened = true;
        this.delayedInfobox = true;
        this.info.open(defaults.map, this.marker);
        return this;
      };

      this.toggleInfo = function() {
        if(this.opened) {
          this.hideInfo();
        } else {
          this.showInfo();
        }
        return this;
      };

      this.setContent = function(html) {
        this.info.setContent(html);
        return this;
      };

      this.setInfo = function(obj, open){
        (typeof open == 'undefined') ? false : open;
        this.info.close();
        this.info = obj;
        this.opened = open;

        if(open){
          this.info.open(defaults.map, this.marker);
        } else {
          this.close();
        }

        google.maps.event.addListener(this.info, 'closeclick', function(){
          self.opened = false;
        });
        return this;
      };

      this.initInfobox = function(){
        var self = this;

        this.opened = this.infoOptions.opened; //Only for use infobox

        if(typeof this.options.content == 'string'){
          if(this.infoOptions.useInfobox){
            this.info = new InfoBox(this.infoOptions);
          } else {
            this.info = new google.maps.InfoWindow(this.infoOptions);
          }
        } else if (this.options.content instanceof InfoBox || this.options.content instanceof google.maps.InfoWindow) {
          this.info = this.options.content;
          this.options.toggleInfoOnClick = true;
          this.opened = false;
        } else {
          this.info = null;
        }
      
        if(this.options.toggleInfoOnClick){
          this.isClickable = true;
          this.marker.setClickable(true);
          this.clickEvent = google.maps.event.addListener(this.marker, "click", function(event) {
            self.toggleInfo();
          });
        } else {
          this.isClickable = false;
          this.marker.setClickable(false);
          if(typeof this.clickEvent == 'object'){
            google.maps.event.removeListener(this.clickEvent);
          }
        };

        google.maps.event.addListener(this.marker, "dragstart", function(event) {
          self.hideInfo();
        });

        this.delayedInfobox = false;

        if(self.options.autopan){
          google.maps.event.addListener(defaults.map, 'idle', function(event){
            if(!self.opened && self.options.openAfterDrag && self.delayedInfobox){
              self.showInfo();
            }
          });
        } else {
          google.maps.event.addListener(this.marker, "dragend", function(event) {
            if(!self.opened && self.options.openAfterDrag && self.delayedInfobox){
              self.showInfo();
            }
          });
        }

        if(this.info){
          google.maps.event.addListener(this.info, 'close', function(){
            self.opened = false;
          });

          google.maps.event.addListener(this.info, 'closeclick', function(){
            self.opened = false;
          });
        }

        if(this.opened){
          self.showInfo();
        };

      };

      (init) ? this.initInfobox() : ''

    };

    (inherit) ? object.prototype = new exports.pins.Basic(opts) : ''

    return new object();
  };

  //A Pin With an Infobox and a Radius
  exports.pins.WithInfoboxAndRadius = function(opts, init, prototype) {

    prototype = (typeof prototype != "undefined") ? prototype : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function() {

      this.removeFromMap = function() {
        this.marker.setMap(null);
        this.handle.setMap(null);
        this.line.setMap(null);
        this.hideCircles();
        return this;
      };

      this.showOnMap = function(map) {
        map = (typeof map != "undefined") ? map : defaults.map;
        this.marker.setMap(map);
        this.handle.setMap(map);
        this.line.setMap(map);
        this.showCircles();
        return this;
      };

      this.initInfoboxAndRadius = function() {
        var self = this;

        google.maps.event.addListener(this.handle, "dragstart", function(event) {
          if(self.opened && self.options.openAfterDrag){
            self.hideInfo();
          }
        });

        google.maps.event.addListener(this.handle, "dragend", function(event) {
          if(!self.opened && self.options.openAfterDrag){
            self.showInfo();
          }
        });
      }

      if(init){
        this.initRadius();
        this.initInfobox();
        this.initInfoboxAndRadius();
      }

    };

    object.prototype = util.merge(new exports.pins.WithRadius(opts, false, true), new exports.pins.WithInfobox(opts, false, false));

    return new object();
  };

  //Helper to generate styled info boxes
  exports.InfoBox = function(content, styleKey){

    style = (typeof styleKey == 'undefined') ? exports.styles.default : exports.styles[styleKey];

    options = util.merge(defaults.info, style.info);
    options.content = content;

    return new InfoBox(options);

  };

  return exports;

}());