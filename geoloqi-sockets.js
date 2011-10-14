geoloqi.Socket = function (type, auth, onLocation, onError) {
  
  var object = function () {
    var self = this;

    var api = "https://subscribe.geoloqi.com:443";
    
    this.auth = auth;
    this.type = type;
    this.onLocation = onLocation;
    this.onError = onError;
    
    this.socket = io.connect(api);

    this.start = function(){
    
      this.socket.on('enter authentication', function(data) {
        self.socket.emit('token', self.type+"-"+self.auth);
      });

      this.socket.on('location', function(data) {
        console.log("location");
        console.log('before');
        console.log(data);
        
        var data = eval("("+data+")");
        
        console.log('after');
        console.log(data);

        self.onLocation(data);
/*
        if(isThereAnError){
          self.onError(data);
        } else {
          self.onLocation(data);
        }
*/
      });  
    };

  };

  object.prototype = {};

  return new object();
};

/*
var friendTrip = new geoloqi.Socket('trip', 'trip_id');
friendTrip.onReceiveLocation = function(location) {
  console.log('RECEIVED: '+location);
};
friendTrip.onReceiveError = function(error) {
  console.log(error);
    console.log('re trying');
  friendTrip.start();
};
friendTrip.start();

friendTrip.stop();
*/
