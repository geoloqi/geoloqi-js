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

    <script type="text/javascript" src="https://api.geoloqi.com/js/versions/geoloqi-1.0.3.min.js"></script>

Usage
---

All the examples are in the demos folder, but here are a few samples to get you started. 

This first example only requires an access token, which all user accounts receive automatically. You can retrieve yours at the [Geoloqi Developers Site](https://developers.geoloqi.com/getting-started).

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

Found a bug?
---
Let us know! Send a pull request or a patch. Questions? Ask! We're here to help. File issues, we'll respond to them!

Authors
---
* Patrick Arlt
* Kyle Drake
* Aaron Parecki

TODO
---
* Mainly cleanups
