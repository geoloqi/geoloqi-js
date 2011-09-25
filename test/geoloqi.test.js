var https = require('https'),
    vows = require('vows'),
    assert = require('assert'),
    geoloqi = require('../lib/geoloqi/geoloqi'),
    fakeweb = require('node-fakeweb');

fakeweb.allowNetConnect = false;
fakeweb.registerUri({uri: 'https://api.geoloqi.com/1/account/username', body: '{"username":"testuser"}'});
fakeweb.registerUri({uri: 'https://api.geoloqi.com/1/account/profile', args:{'lol':'cats'}, body: '{"result":"ok"}'});

fakeweb.registerUri({uri: 'https://api.geoloqi.com/1/oauth/token',
                     body: JSON.stringify({
                            "access_token":"4321dcba",
                            "token_type":"test",
                            "expires_in":3600,
                            "refresh_token":"lolcats"})});

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
  },

  'when authorizing a code': {
    topic: function() {
      var session = new geoloqi.Session({}, {'client_id': 'idtest', 'client_secret': 'secrettest', 'redirect_uri':'http://example.org/test'});
      session.authorize('abcd1234', this.callback);
    },
    'we get an access token json': function(result, err) {
      assert.equal(result.access_token, '4321dcba');
    }
  }
}).run();