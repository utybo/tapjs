module.exports =
[ [ 'line', 'ok 1\n' ],
  [ 'line', 'ok 2\n' ],
  [ 'assert', { ok: true, id: 1 } ],
  [ 'line', 'ok 3\n' ],
  [ 'assert', { ok: true, id: 2 } ],
  [ 'line', 'ok 4\n' ],
  [ 'assert', { ok: true, id: 3 } ],
  [ 'assert', { ok: true, id: 4 } ],
  [ 'complete', { ok: false, count: 4, pass: 4 } ] ]
