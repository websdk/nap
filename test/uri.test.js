var test = require('tape')
  , nap  = require('../src/nap')

test('Simple URI patterns', function(t) {
  t.plan(4)
  var web = nap.web().resource('demo', '/my-demo', function() {})

  t.equal(web.uri('demo'), '/my-demo', 'should generate a URI based on resource name')
  t.equal(web.uri('/my-demo'), '/my-demo', 'should generate a URI based on resource path')
  t.equal(web.uri('/'), '/', 'should generate a URI based on root resource path')
  t.equal(web.uri(''), '/', 'should generate a URI based on empty resource path')
})

test('Complex URI patterns', function(t) {
  t.plan(3)
  var web = nap.web().resource('demo', '/my-demo/{id}', function(){})

  t.equal(web.uri('demo', { id : 'foo' }), '/my-demo/foo', 'should generate a URI based on resource name and params')
  t.equal(web.uri("/my-demo/{id}", { id : "foo" }), '/my-demo/foo', 'should generate a URI based on resource path and params')
  t.equal(web.uri("/my-demo/bar", { id : "foo" }), '/my-demo/bar', 'should be non-destructive if no variable parts present')
})