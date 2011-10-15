geoloqi.Socket = function (type, auth, onLocation, onDisconnect) {

  var object = function () {
    var self = this;
    var api = "https://subscribe.geoloqi.com:443";

    this.auth = auth;
    this.type = type;
    this.onLocation = onLocation;
    this.onDisconnect = onDisconnect;

    this.socket = io.connect(api);

    this.start = function(){
      this.socket.on('enter authentication', function(data) {
        self.socket.emit('token', self.type+"-"+self.auth);
      });

      this.socket.on('location', function(data) {
        var data = JSON.parse(data);
        self.onLocation(data);
      });

      this.socket.on('disconnect', self.onDisconnect);
    };

  };

  object.prototype = {};

  return new object();
};