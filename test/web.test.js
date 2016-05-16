var nap    = require('../src/nap')
  , test   = require('tape')
  , get    = require('funkis').get

test('Web instances', function(t) {
  t.plan(1)

  var w1 = nap.web()
    , w2 = nap.web()

  t.notEqual(nap.web(), nap.web(), 'should be distinct')
})

test('Web resources belong to a single web', function(t) {
  t.plan(2)

  var w1 = nap.web()
    , w2 = nap.web()
    , fn = function() { t.ok(true, 'resource added to w1') }

  w1.resource('/wibble', fn)
  get(w1.resource('/wibble'), 'handler')()
  t.notOk(w2.resource('/wibble'), 'resource not added to w2')
})

test('Web resources can be named', function(t) {
  t.plan(2)

  var web = nap.web()
    , fn = function() { t.ok(true, 'resource added') }

  web.resource('wobble', '/foo/bar', fn)
  t.ok(web.req('/foo/bar'), 'handler called')
})

test('Web resources can be anonymous', function(t) {
  t.plan(2)
  
  var web = nap.web()
    , fn = function() { t.ok(true, 'resource added') }

  web.resource('/foo/{val}', fn)
  t.ok(web.req('/foo/bean'), 'handler called')
})

test('Web resource requests are routed via URI', function(t) {
  t.plan(1)

  var web = nap.web()

  web.resource('/foo/bar', handler)
  web.req('/foo/bar')

  function handler(req) {
    t.deepEqual(req,
      { uri: '/foo/bar'
      , web: web
      , method: 'get'
      , headers: { accept: 'application/x.nap.view' }
      , params: {}
      }
    , 'handler called'
    )
  }
})

test('Web resource handlers should invoke a response callback if given', function(t) {
  t.plan(1)
  var web = nap.web()

  web.resource('/foo/bar', function(req, res) {
    res(null, nap.responses.ok('where am I?'))
  })

  web.req('/foo/bar', function(err, res) {
    t.deepEqual(res,
      { body: 'where am I?'
      , statusCode: 200
      , headers: {}
      }
    , 'callback invoked'
    )
  })
})

test('Web should return handler, params, and metadata when finding a resource by path', function(t) {
  t.plan(12)
  var web  = nap.web()
    , fn_a = function() { t.ok(true, 'resource a handler will be called') }
    , fn_b = function() { t.ok(true, 'resource b handler will be called') }
    , fn_c = function() { t.ok(true, 'resource c handler will be called') }
    , fn_d = function() { t.ok(true, 'resource d handler will be called') }

  web.resource('/no/metadata/no/params', fn_a)
  var a = web.find('/no/metadata/no/params')
  a.fn()
  t.deepEqual(a.params, {}, 'resource a params exists')
  t.deepEqual(a.metadata, {}, 'resource a metadata exists')

  web.resource('/with/metadata/no/params', fn_b, { foo: 'bar' })
  var b = web.find('/with/metadata/no/params')
  b.fn()
  t.deepEqual(b.params, {}, 'resource a params exists')
  t.deepEqual(b.metadata, { foo: 'bar' }, 'resource b metadata exists')

  web.resource('/{with}/metadata/and/{params}', fn_c, { baz: 'wibble' })
  var c = web.find('/some/metadata/and/fun')
  c.fn()
  t.deepEqual(c.params, { with: 'some', params: 'fun' }, 'resource c params exists')
  t.deepEqual(c.metadata, { baz: 'wibble' }, 'resource c metadata exists')

  web.resource('named', '/also/{with}/metadata/and/{params}', fn_d, { boo: 'moo' })
  var d = web.find('/also/some/metadata/and/fun')
  d.fn()
  t.deepEqual(d.params, { with: 'some', params: 'fun' }, 'resource d params exists')
  t.deepEqual(d.metadata, { boo: 'moo' }, 'resource d metadata exists')
})

test("Web should respond with a 404 if no resource is found", function(t) {
  t.plan(1)
  var web = nap.web()

  web.req("/sausage", function(_, res) {
    t.deepEqual(res, { statusCode: 404, headers: {} }, '404 response received')
  })
})

test("Web should respond with a 405 if no supported method is found", function(t) {
  t.plan(1)
  var web = nap.web()

  web.resource(
    "/sausage", nap.negotiate.method({ get : function(req, res) {} })
  )

  web.req({uri: "/sausage", method: "send"}, function(_, res) {
    t.deepEqual(res, { statusCode: 405, headers: {} }, '405 response received')
  })
})

test("Web should respond with a 415 if no supported media type is found", function(t) {
  t.plan(1)
  var web = nap.web()

  web.resource(
    "/sausage" 
  , nap.negotiate.method({
      get: nap.negotiate.accept({ json: function(req,res) {} })
    })
  )
  web.req("/sausage", function(_, res) {
    t.deepEqual(res, { method: 'get', statusCode: 415, headers: {} }, '415 response received')
  })
})