var geoloqi = (function (google) {

  //Public Facing Object
  var geoloqi = {};

  //Hold Styles
  var styles = [];

  styles["default"] = {
    marker:{
      icon: new google.maps.MarkerImage('http://geoloqi.s3.amazonaws.com/website/map-marker.png?1', new google.maps.Size(20,32), new google.maps.Point(0,0), new google.maps.Point(10,31)),
      shadow: new google.maps.MarkerImage('http://geoloqi.s3.amazonaws.com/website/map-marker-shadow.png?1', new google.maps.Size(40,32), new google.maps.Point(0,0), new google.maps.Point(10,32))
    },
    circles: {
      count: 5,
      color: "#fff",
      opacity: .15,
      stroke: {
        color: "#fff",
        weight: 0,
        opacity: 0.0,
      }
    },
    handle: {
      icon: new google.maps.MarkerImage('http://geoloqi.s3.amazonaws.com/website/map-marker-handle.png?1', new google.maps.Size(20,20), new google.maps.Point(0,0), new google.maps.Point(10,10)),
      shadow: null
    },
    line: {
      color: "#000",
      weight: 1,
      opacity: 1
    },
    infobox: {
      closeBoxMargin: '3px',
      closeBoxURL: '',
      boxStyle: {
        width: "280px",
        background: "white",
        border: "1px solid #000"
      },
      pixelOffset: new google.maps.Size(-140, -34),
      alignBottom: true
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
      radius: 100
    },
    line: {
      clickable: false,
      strokeColor: styles['default'].line.color,
      strokeOpacity: styles['default'].line.opacity,
      strokeWeight: styles['default'].line.weight,
      map: null
    },
    handle: {
      icon: styles['default'].handle.icon,
      shadow: styles['default'].handle.shadow,
      map: null,
      draggable: true,
      raiseOnDrag: false,
      clickable: false,
      visible: true
    },
    infobox: {
      alignBottom:true,
      enableEventPropagation: false,
      maxWidth: 0,
      content: '',
      boxStyle: {},
      pane: "floatPane",
      isHidden: false
    }
  }

  //Sets the default map everything should reference
  geoloqi.setMap = function(newMap){
    defaults.map = newMap;
    defaults.pin.map = newMap;
    defaults.line.map = newMap;
    defaults.handle.map = newMap;
    //@TODO Check is this is a google map object
  };

  geoloqi.getMap = function(){
    return defaults.map;
  }

  //Public Methods for Styles
  geoloqi.styles = {}

  //Add a style that can be reused later
  geoloqi.styles.define = function(name, style){
    styles[name] = util.merge(styles['default'], style)
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

  // addMethod - By John Resig (MIT Licensed)
  util.addMethod =  function(object, name, fn){
    var old = object[ name ];
    object[ name ] = function(){
        if ( fn.length == arguments.length )
            return fn.apply( this, arguments );
        else if ( typeof old == 'function' )
            return old.apply( this, arguments );
    };
  }

  //Namespace for pins
  geoloqi.pins = {};

  //Basic Pin
  geoloqi.pins.Basic = function(opts, init){

    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    //Merge Custom Options into defaults
    var options = util.merge(defaults.pin, opts);
    var style = styles[options.style];

    options.icon = style.marker.icon;
    options.shadow = style.marker.shadow;

    var object = function(){
      var self = this;
      (init) ? this.initPin() : '';
    };

    object.prototype = {
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
        this.marker = new google.maps.Marker(options);
      }
    };

    return new object();
  };

  //A Pin With A Radius
  geoloqi.pins.WithRadius = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    //Merge Custom Options into defaults
    options = util.merge(defaults.pin, opts);
    style = styles[options.style];
    handle = util.merge(defaults.handle, style.handle);
    line = util.merge(defaults.line, style.line);

    var object = function(){

      // Properties
      // ==========
      var self = this;

      // Methods
      // =======

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

        if(this.circles.length > 0){
          for(var i = 0; i<this.circles.length; i++) {
            this.circles[i].circle.setMap(null);
          }
        }
        this.circles = [];

        for(var i = 0; i<style.circles.count; i++) {
          this.circles.push({
            circle: new google.maps.Circle({
              center: this.getPosition(),
              radius: radius - (i*3),
              fillColor: style.circles.color,
              fillOpacity: style.circles.opacity,
              strokeColor: style.circles.stroke.color,
              strokeWeight: style.circles.stroke.weight,
              strokeOpacity: style.circles.stroke.opacity,
              map: (visible) ? defaults.map : null
            }),
            index: i
          });
          this.circles[i].circle.bindTo('center', this.marker, 'position');
        }
      };

      this.updateHandle = function(){
        console.log(this.marker.getPosition());
        console.log(this.getRadius());
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
        this.handle = new google.maps.Marker(handle);
        this.line = new google.maps.Polyline(line);
        this.circles = [];

        //Setup Circles
        this.setupCircles(options.radius);

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
        // Center map on the pin, show infobox, handle and Line
        google.maps.event.addListener(this.marker, "dragend", function(event) {
          self.showHandle();
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

          for(var i = 0; i<style.circles.count; i++) {
            self.circles[i].circle.setRadius(newRadius - (i*3));
          }
        });
      };

      // Init
      // ====
      (init) ? this.initRadius() : '';
    };

    (inherit) ? object.prototype = new geoloqi.pins.Basic(opts) : '';

    return new object();
  };

  //A Pin With An Infobox
  geoloqi.pins.WithInfobox = function(opts, init, inherit) {

    inherit = (typeof inherit != "undefined") ? inherit : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    //Merge Custom Options into defaults
    options = util.merge(defaults.pin, opts);
    style = styles[options.style];

    infoboxTmp = util.merge(defaults.infobox, opts);
    infobox = util.merge(infoboxTmp, style.infobox);

    var object = function(){
      var self = this;

      this.infobox = new InfoBox(infobox);

      this.hideInfobox = function() {
        this.infobox.hide();
      }

      this.showInfobox = function() {
        this.infobox.show();
      }

      this.setContent = function(html) {
        this.infobox.setContent(html);
      }

      this.initInfobox = function(){
        google.maps.event.addListener(this.marker, "dragstart", function(event) {
          self.hideInfobox();
        });
        google.maps.event.addListener(this.marker, "dragend", function(event) {
          self.showInfobox();
        });
        this.infobox.open(defaults.map, this.marker);

      };



      (init) ? this.initInfobox() : ''

    };

    (inherit) ? object.prototype = new geoloqi.pins.Basic(opts) : ''

    return new object();
  };

  //A Pin With an Infobox and a Radius
  geoloqi.pins.WithInfoboxAndRadius = function(opts, init, prototype) {

    prototype = (typeof prototype != "undefined") ? prototype : true; //Turn on prototypes
    init = (typeof init != "undefined") ? init : true; //Turn on prototypes

    var object = function(){
      var self = this;

      this.initInfoboxAndRadius = function() {
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

    object.prototype = util.merge(new geoloqi.pins.WithRadius(opts, false, true), new geoloqi.pins.WithInfobox(opts, false, false));

    return new object();
  };

  return geoloqi;

}(google));