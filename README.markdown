Geoloqi Javascript Library for Web Browsers
===

This is an interface library for the Geoloqi platform, written in JavaScript for the web browser.

Similar to Facebook's connect-js, this library allows you to develop rich web applications using only javascript. There are no backend/server requirements - all you need to get started is a web browser and a text editor!

This library is split up into three javascript files in the source:

* geoloqi-client.js - Interface for the Geoloqi client platform, for making calls to the API
* geoloqi-maps.js - Helper code for interfacing Geoloqi with Google Maps
* geoloqi-socket.js - Allows you to stream data from Geoloqi's servers in real time using Web Sockets!

You can load them all right now from our CDN, with one file!

    <script type="text/javascript" src="https://api.geoloqi.com/js/geoloqi.min.js"></script>
    
This file will always be the latest version. If you'd prefer to fix to a specific version, check the versions folder:

    <script type="text/javascript" src="https://api.geoloqi.com/js/versions/geoloqi-1.0.12.min.js"></script>

Usage
---

All the examples are in the demos folder, but here are a few samples to get you started. 

This first example only requires an access token, which all user accounts receive automatically. You can retrieve yours at the [Geoloqi Developers Site](https://developers.geoloqi.com/getting-started). 

**You should never use your access token in production applicaitons as it would allow anyone to read/write your data.** 
It is only used here for demonstration purposes.

    <!DOCTYPE html>
    <html>
      <head>
        <script type="text/javascript" src="http://api.geoloqi.com/js/geoloqi.min.js"></script>
        <script type="text/javascript">
          window.onload = function () {
            geoloqi.init();
            geoloqi.auth = {'access_token': 'YOUR ACCESS TOKEN GOES HERE'};

            function getLastLocation() {
              geoloqi.get('location/last', function(result, error) {
                console.log(result);
              });
            }

            function changeProfileWebsite() {
              geoloqi.post('account/profile', {'website':'http://example.org/my_cool_site'}, function(result, error) {
                console.log(result);
              });
            }
          }
        </script>
        <title>Geoloqi Client JS Test with Access Token</title>
      </head>
      <body>
        <a href="#" onclick="getLastLocation(); return false">Get Last Location</a>
        <br>
        <a href="#" onclick="changeProfileWebsite(); return false">Change Profile Website</a>
        <br>
      </body>
    </html>

Want to make an application with OAuth2? Create an application at the [Geoloqi Developers Site](https://developers.geoloqi.com/applications) and try this:

    <html>
      <head>
        <script type="text/javascript" src="https://api.geoloqi.com/js/geoloqi.min.js"></script>
        <script type="text/javascript">
          window.onload = function () {
            geoloqi.init({'client_id': 'YOUR_CLIENT_ID_FROM_DEVELOPERS.GEOLOQI.COM'});
          }

          function getProfile() {
            geoloqi.get('account/profile', function(result, error) {
              console.log(result);
            });
          }
        </script>
        <title>Geoloqi Client JS Test</title>
      </head>
      <body>
        <div id="geoloqi-root" style="display:none;"></div>
        <a href="#" onclick="geoloqi.authenticate(); return false">Login Directly</a>
        <br>
        <a href="#" onclick="geoloqi.authenticateWithPopup(); return false">Login via popup (not supported in IE)</a>
        <br>
        <a href="#" onclick="getProfile(); return false">Get Profile</a>
        <br>
        <a href="#" onclick="geoloqi.expire(); return false">Logout</a>
        <br><br>
      </body>
    </html>

Config Options
---
    geoloqi.init({
      client_id: '[STRING : enter your client_id here (get your applications client_id at https://developers.geoloqi.com/account/applications)]',
      package_name: '[STRING : an optional name for your package (will be tracked in statistics at https://developers.geoloqi.com/account)]',
      package_version: '[STRING : an optional version for your package (will be tracked in statistics at https://developers.geoloqi.com/account)]',
      persist: '[STRING : should be either localStorage or cookie, sets the persistance method used to store user sessions. Uses localStorage if available and cookies if not]'
    })
    
Making API Requests
---

To make requests to the [Geolqoi API](https://developers.geoloqi.com/api) you will need to authenticate the user with `geoloqi.login(username, password)`, `geoloqi.authenticate()` or  `geoloqi.authenticateWithPopup()`.

Once the user is authenticated you can use `geolqoi.get()` or `geoloqi.post()` to make requests.

#### `geoloqi.get(method, arguments, callback, context)`


* `path` is the API method you want to run. You can find a full list of API methods [here](https://developers.geoloqi.com/api).
* `arguments` is an optional object that will encoded as a query string before being sent to the API.
* `callback` is a function that will be run when the request is complete. Takes `response` and `error` params
* `context` optional, will bind the callback function to the given context. Similar to [_.bind](http://documentcloud.github.com/underscore/#bind) and [jQuery.proxy](http://api.jquery.com/jQuery.proxy/)

**Examples**
    
Get the authenticated users profile

    geoloqi.get('account/profile', function(response, error){
      console.log(response, error);
    });
    
Get nearby places

    geoloqi.get('place/nearby', {
      latitude: 45.516454,
      longitude: -122.675997,
      radius: 100
    }, function(response, error){
        console.log(response, error);
    });
    
Get the users last known location and run the callback where this = User

    User = {
      latitude: null,
      longitude: null
    };
    
    //arguments are optional
    geoloqi.get('location/last', function(response, error){
      this.latitude = response.location.position.latitude;
      this.longitude = response.location.position.longitude;
    }, User);
    
#### `geoloqi.post(method, arguments, callback, context)`

* `path` the API method you want to run. You can find a full list of API methods [here](https://developers.geoloqi.com/api).
* `arguments` an object that will encoded as a query string before being sent to the API.
* `callback` a function that will be run when the request is complete. Takes `response` and `error` params
* `context` optional, will bind the callback function to the given context. Similar to [_.bind](http://documentcloud.github.com/underscore/#bind) and [jQuery.proxy](http://api.jquery.com/jQuery.proxy/)

**Examples**

Update the users profile

    geoloqi.post("account/profile", {
        'website': "http://mycoolsite.com"
    }, function(response, error){
        console.log(response, error);
    });
    
Create a new place for the user

    geoloqi.post("place/create", {
      latitude: 45.516454,
      longitude: -122.675997,
      radius: 100,
      name: "Geoloqi Office"
    }, function(response, error){
        console.log(response, error)
    });

Batch Requests
---

The Geoloqi API supports running multupile requests at once through the `batch/run` method. you can use the `geolqoi.Batch()` helper to build batch requests and send then to the API. This is particularly good for things such as initialization functions where you may want to make multupile requests at once.

    MyApp = {
      places: [],
      User: {
        profile: {},
        location: {}
      }
    }

    init_batch = new geoloqi.Batch();
    
    init_batch.get("account/profile")
              .get("place/list", {limit: 50})
              .get("location/last");
           
    // Run with a context
    init_batch.run(function(response){
      // response.result is an array of responses in the order you requested them.
      console.log(response.result);
      this.places = response.result[0].body.places;
      this.User.profile = response.result[1].body;
      this.User.location = response.result[2].body;
    }, MyApp);
    
    // Run without a context
    init_batch.run(function(response){
      // response.result is an array of responses in the order you requested them.
      MyApp.places = response.result[0].body.places
      MyApp.User.profile = response.result[1].body
      MyApp.User.location = response.result[2].body
    });
              
HTML5 Geolocation Helpers
---

Using HTML5s new geolocation features you can update users locations in the Geoloqi API with geolqoi.js once you have authenticated a user.



#### `geoloqi.updateLocation()`

You can use `geoloqi.updateLocation()` to make a one time update to a users location. It uses the standard `navigator.geolocation.getCurrentPosition` function under the hood and send the results to the Geoloqi API and a optional callback function.

**Options**

* success: a function that will be run after successfully updating a users location. Will recive a HTML5 position object as its parameter.
* error: function will be run if there was an error getting or updating the users location
* context: an object to bind the context of the callback functions

** Example **

    geoloqi.updateLocation({
      success: function(position){
        console.log("updated users position", position);
      },
      error: function(error){
        console.log("there was an error", error);
      }
    });

#### `geoloqi.watchLocation()`

You can use `geoloqi.watchLocation()` to make update a users location as it changes. Impliments `navigator.geolocation.watchPosition` under the hood and sends each point to the Geoloqi API and a callback function.

**Options**

* success: a function that will be run after successfully updating a users location. Will recive a HTML5 position object as its parameter.
* error: function will be run if there was an error getting or updating the users location
* context: an object to bind the context of the callback functions

** Example **

    // when initialized this will start watching a users location automatically
    watch_user = new geoloqi.watchPosition({
      success: function(position){
        console.log("updated users position", position);
      },
      error: function(error){
        console.log("there was an error", error);
      }
    });
    
    // stop watching a users location
    watch_user.stop();
    
    // start watching a users location again
    watch_user.start();

Found a bug?
---
Let us know! Send a pull request or a patch. Questions? Ask! We're here to help. File issues, we'll respond to them!

Authors
---
* Patrick Arlt
* Kyle Drake
* Aaron Parecki

TODOS
---
* Full API documentation
