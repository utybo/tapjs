module.exports =
[ [ 'line', '1..1\n' ],
  [ 'plan', { start: 1, end: 1 } ],
  [ 'line', 'ok 1 - 42\n' ],
  [ 'assert', { ok: true, id: 1, name: '42' } ],
  [ 'complete',
    { ok: true, count: 1, pass: 1, plan: { start: 1, end: 1 } } ] ]
