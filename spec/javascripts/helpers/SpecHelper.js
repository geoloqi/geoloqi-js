beforeEach(function() {
  this.addMatchers({
    toBeProfile: function() {
      return this.actual.user_id === geoloqi.auth.user_id
    }
  });
});