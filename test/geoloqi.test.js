var https = require('https'),
    vows = require('vows'),
    assert = require('assert'),
    geoloqi = require('../lib/geoloqi/geoloqi'),
    fakeweb = require('node-fakeweb');

fakeweb.allowNetConnect = false;
fakeweb.registerUri({uri: 'https://api.geoloqi.com/1/account/username', body: '{"username":"testuser"}'});
fakeweb.registerUri({uri: 'https://api.geoloqi.com/1/account/profile', body: '{"result":"ok"}'});

var sessionConfig = {'access_token': '1234',
                     'redirect_uri': 'http://test',
                     'client_id': 'client_id',
                     'client_secret': 'client_secret'};

vows.describe('Geoloqi Session').addBatch({
  'when making get request for a username': {
    topic: function() {
      var session = new geoloqi.Session();
      session.get('account/username', this.callback);
    },

    'we get a username': function (result, err) {
      assert.equal(result.username, 'testuser');
    }
  },
  'when posting a profile': {
    topic: function() {
      var session = new geoloqi.Session();
      session.post('account/profile', {}, this.callback);
    },
    'we get an ok response': function (result, err) {
      assert.equal(result.result, 'ok');
    }
  }
}).run();