var fakeweb = require('fakeweb'),
    http = require('http')
http.register_intercept({
    uri: '/foo', 
    host: 'test.com',
    body: 'Im the mocked-out body!'
})

http.request({uri: "/foo", host: "test.com"}, function(response){})