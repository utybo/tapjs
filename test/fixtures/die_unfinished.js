module.exports =
[ [ 'line', '1..4\n' ],
  [ 'plan', { start: 1, end: 4 } ],
  [ 'line', 'ok 1\n' ],
  [ 'line', 'ok 2\n' ],
  [ 'assert', { ok: true, id: 1 } ],
  [ 'line', 'ok 3\n' ],
  [ 'assert', { ok: true, id: 2 } ],
  [ 'assert', { ok: true, id: 3 } ],
  [ 'complete',
    { ok: false, count: 3, pass: 3, plan: { start: 1, end: 4 } } ] ]
