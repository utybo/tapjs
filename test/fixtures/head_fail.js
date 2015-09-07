module.exports =
[ [ 'line', '# comments\n' ],
  [ 'comment', '# comments\n' ],
  [ 'line', 'ok 1\n' ],
  [ 'line', 'not ok 2\n' ],
  [ 'assert', { ok: true, id: 1 } ],
  [ 'line', 'ok 3\n' ],
  [ 'assert', { ok: false, id: 2 } ],
  [ 'line', 'ok 4\n' ],
  [ 'assert', { ok: true, id: 3 } ],
  [ 'line', '# comment\n' ],
  [ 'line', '1..4\n' ],
  [ 'assert', { ok: true, id: 4 } ],
  [ 'comment', '# comment\n' ],
  [ 'plan', { start: 1, end: 4 } ],
  [ 'line', '# more ignored stuff\n' ],
  [ 'comment', '# more ignored stuff\n' ],
  [ 'line', '# and yet more\n' ],
  [ 'comment', '# and yet more\n' ],
  [ 'complete',
    { ok: false,
      count: 4,
      pass: 3,
      fail: 1,
      plan: { start: 1, end: 4 },
      failures: [ { ok: false, id: 2 } ] } ] ]
