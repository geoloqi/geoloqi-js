geoloqi.Socket = function ('type', 'auth', onLocation, onError) {
  
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
        this.socket.emit('token', this.type+this.auth);
      });

      this.socket.on('location', function(data) {
        console.log('before');
        console.log(data);
        var data = eval("("+data+")");
        console.log('after');
        console.log(data);
        if(isThereAnError){
          this.onError(data);
        } else {
          this.onLocation(data);
        }
      });
    
    };

  };

  object.prototype = {};

  return new object();
};