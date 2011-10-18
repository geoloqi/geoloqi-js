
/* Events
start
onlocation
disconnect 
*/

if(typeof geoloqi === 'undefined') {
  var geoloqi = {};
}

geoloqi.Socket = function (type, auth, events) {

  var object = function () {

    events = (typeof events == "undefined") ? {} : events;

    var self = this;
    var api = "https://subscribe.geoloqi.com:443";

    this.auth = auth;
    this.type = type;
    this.events = {
      start: events.start || null,
      location: events.location || null,
      disconnect: events.disconnect || null
    };

    this.socket = io.connect(api);

    this.start = function(){
      this.socket.on('enter authentication', function(data) {
        self.socket.emit('token', self.type+"-"+self.auth);
        self.events.start;
      });

      this.socket.on('location', function(data) {
        var data = JSON.parse(data);
        self.events.location(data);
      });

      this.socket.on('disconnect', self.events.disconnect);
    };

  };

  return new object();
};