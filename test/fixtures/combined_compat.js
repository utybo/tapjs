module.exports =
[ [ 'line', '1..10 todo 4 10\n' ],
  [ 'extra', '1..10 todo 4 10\n' ],
  [ 'line', 'ok 1\n' ],
  [ 'line', 'ok 2 basset hounds got long ears\n' ],
  [ 'assert', { ok: true, id: 1 } ],
  [ 'line', 'not ok 3        all hell broke lose\n' ],
  [ 'assert',
    { ok: true, id: 2, name: 'basset hounds got long ears' } ],
  [ 'line', 'ok 4\n' ],
  [ 'assert', { ok: false, id: 3, name: 'all hell broke lose' } ],
  [ 'line', 'ok\n' ],
  [ 'assert', { ok: true, id: 4 } ],
  [ 'line', 'ok 6\n' ],
  [ 'assert', { ok: true, id: 5 } ],
  [ 'line', 'ok 7            # Skip contract negociations\n' ],
  [ 'assert', { ok: true, id: 6 } ],
  [ 'line', 'ok 8\n' ],
  [ 'assert',
    { ok: true, id: 7, skip: 'contract negociations', name: '' } ],
  [ 'line', 'not ok 9\n' ],
  [ 'assert', { ok: true, id: 8 } ],
  [ 'line', 'not ok 10\n' ],
  [ 'assert', { ok: false, id: 9 } ],
  [ 'assert', { ok: false, id: 10 } ],
  [ 'complete',
    { ok: false,
      count: 10,
      pass: 7,
      fail: 3,
      skip: 1,
      failures: 
       [ { ok: false, id: 3, name: 'all hell broke lose' },
         { ok: false, id: 9 },
         { ok: false, id: 10 } ] } ] ]
