module.exports =
[ [ 'line', '1..2\n' ],
  [ 'plan', { start: 1, end: 2 } ],
  [ 'line', 'ok 1    Should parse as literal backslash --> \\\n' ],
  [ 'line', 'ok 2    Not a continuation line\n' ],
  [ 'assert',
    { ok: true,
      id: 1,
      name: 'Should parse as literal backslash --> \\' } ],
  [ 'assert',
    { ok: true, id: 2, name: 'Not a continuation line' } ],
  [ 'complete',
    { ok: true, count: 2, pass: 2, plan: { start: 1, end: 2 } } ] ]
