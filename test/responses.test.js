import test from 'tape'
import nap from '../src/nap'

test("Responding ok should yield a successful response", function(t) {
  t.plan(1)

  t.deepEqual(nap.responses.ok('hello'),
    { body: "hello"
    , statusCode : 200
    , headers : {}
    }
  , '200 OK'
  )
})