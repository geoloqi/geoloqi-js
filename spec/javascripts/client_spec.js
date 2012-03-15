beforeEach(function(){
  geoloqi.init({'client_id': '4cd87809ded4d0e8d1a592142bea6f31'});
});

describe("Geoloqi Client Authentication", function() {

  beforeEach(function(){
    geoloqi.expire();
  });

  it("should authenticate with a username and password.", function(){
    
    runs(function(){
      geoloqi.login({
        username: 'spampk',
        password: '123454321'
      });
    });
    
    waitsFor(function(){
      return geoloqi.logged_in();
    }, "authentication with username and password timeout", 3000);
    
    runs(function(){
      expect(typeof geoloqi.auth.access_token).toEqual("string");
    });
  
  });

  it(" should run geoloqi.onAuthorize() on a successful login", function(){
    runs(function(){
      spyOn(geoloqi, "onAuthorize");
      geoloqi.login({
        username: 'spampk',
        password: '123454321'
      });
    });

    waitsFor(function(){
      return geoloqi.onAuthorize.callCount;
    }, "authentication with username and password timeout", 3000);

    runs(function(){
      expect(geoloqi.onAuthorize).toHaveBeenCalled();
    });

  });
  
  it("should run geoloqi.onLoginError() on an incorrect password", function(){
    runs(function(){
      spyOn(geoloqi, "onLoginError");
      spyOn(geoloqi, "onAuthorize");
      geoloqi.login({
        username: 'spampk',
        password: 'not-the-password'
      });
    });

    waitsFor(function(){
      return geoloqi.onLoginError.callCount;
    }, "authentication with username and password timeout", 3000);

    runs(function(){
      expect(geoloqi.onLoginError).toHaveBeenCalledWith({"error":"invalid_grant","error_description":"Invalid username or password"});
      expect(geoloqi.onAuthorize).not.toHaveBeenCalled();
      expect(geoloqi.auth).toBeNull();
    });
  });

  it("logged_in() should return true if we are logged in", function(){
    runs(function(){
      spyOn(geoloqi, "onAuthorize");
      geoloqi.login({
        username: 'spampk',
        password: '123454321'
      });
    });

    waitsFor(function(){
      return geoloqi.onAuthorize.callCount;
    }, "authentication with username and password timeout", 3000);

    runs(function(){
      expect(geoloqi.auth && geoloqi.auth.access_token).toBeTruthy();
      expect(geoloqi.logged_in()).toBeTruthy();  
    });
    
  });

  it("logged_in() should return false if we are logged out", function(){
    expect(geoloqi.logged_in() && geoloqi.auth && geoloqi.auth.access_token).toBeFalsy();
  });

  it("should erase a session when expire() is called", function(){
    runs(function(){
      geoloqi.login({
        username: 'spampk',
        password: '123454321'
      });
    });

    waitsFor(function(){
      return geoloqi.auth;
    }, "authentication with username and password timeout", 3000);

    runs(function(){
      geoloqi.expire();
      expect(geoloqi.logged_in()).toBeFalsy(false);
      expect(document.cookie).toBeFalsy();
      expect(localStorage.getItem("_geoloqi.auth")).toBeFalsy();
    });

  });

});

describe("Geoloqi API Client", function() {
  
  beforeEach(function(){
    if(!geoloqi.logged_in){
      runs(function(){
        geoloqi.login({
          username: 'spampk',
          password: '123454321'
        });
      });
    }

    waitsFor(function(){
      return geoloqi.logged_in;
    }, "geoloqi.get() timeout", 3000);
  });

  it("should get the users profile and execute a callback function", function(){
    
    callback = jasmine.createSpy();
    
    runs(function(){
      geoloqi.get("account/profile", {}, callback);
    });

    waitsFor(function(){
      return callback.callCount;
    }, "geoloqi.get() timeout", 3000);

    runs(function(){
      expect(callback).toHaveBeenCalled();
      expect(callback.mostRecentCall.args[0].user_id).toEqual(geoloqi.auth.user_id);
      expect(callback.mostRecentCall.args[1]).toBeUndefined();
    });

  });

  it("should run the callback with an error object if the server returns an error", function(){
    
    callback = jasmine.createSpy();
    
    runs(function(){
      geoloqi.get("accountt/profile", {}, callback);
    });

    waitsFor(function(){
      return callback.callCount;
    }, "geoloqi.get() timeout", 3000);

    runs(function(){
      expect(callback).toHaveBeenCalled();
      expect(callback.mostRecentCall.args[0]).toBeUndefined();
      expect(typeof callback.mostRecentCall.args[1].error).toBeTruthy();  
    });

  });

  it("shoud post and update to the users profile", function(){
    callback = jasmine.createSpy();

    runs(function(){
      geoloqi.post("account/profile", {}, callback);
    });

    waitsFor(function(){
      return callback.callCount;
    }, "geoloqi.post() timeout", 3000);

    runs(function(){
      expect(callback).toHaveBeenCalled();
      expect(callback.mostRecentCall.args[0].response).toEqual("ok");
      expect(callback.mostRecentCall.args[1]).toBeUndefined();
    });

  });
});