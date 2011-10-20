Geoloqi Javascript Library for Web Browsers
===
This is an interface library for the Geoloqi platform, written in JavaScript for the web browser.

Similar to Facebook's connect-js, this library allows you to develop rich web applications using only javascript. There are no backend/server requirements - all you need to get started is a web browser and a text editor!

This library is split up into three javascript files:

* geoloqi-client.js - Interface for the Geoloqi client platform, for making calls to the API
* geoloqi-maps.js - Helper code for interfacing Geoloqi with Google Maps
* geoloqi-socket.js - Allows you to stream data from Geoloqi's servers in real time using Web Sockets!

Usage
---

Consult the demos folder for code examples. Don't forget to create an application at the [Geoloqi Developers Site](https://developers.geoloqi.com). Here is a client example to get you started:

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
        <a href="#" onclick="geoloqi.authenticate(); return false">Authenticate Session</a>
        <br>
        <a href="#" onclick="getProfile(); return false">Get Profile</a>
        <br>
        <a href="#" onclick="geoloqi.expire(); return false">Expire Session</a>
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
