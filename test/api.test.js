import nap from '../src/nap'
import test from 'tape'
import { get, is } from 'funkis'

test('API integrity', function(t) {
  t.plan(12)

  ;[ 'web'
   , 'is'
   , 'into'
   , 'negotiate.selector'
   , 'negotiate.method'
   , 'negotiate.accept'
   , 'responses.ok'
   , 'responses.error'
   ].forEach(function(api) {
    t.ok(is(Function, get(nap, api.split('.'))), 'nap.' + api + ' exists')
   })

  ;[ 'resource'
   , 'req'
   , 'use'
   , 'uri'
   ].forEach(function(api) {
    t.ok(is(Function, get(nap.web(), api)), 'nap.web().' + api + ' exists')
   })
})