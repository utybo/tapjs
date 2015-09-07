module.exports =
[ [ 'line', '1..3\n' ],
  [ 'plan', { start: 1, end: 3 } ],
  [ 'line', 'ok 1    Not a \\# TODO\n' ],
  [ 'line', 'ok 2    Not a \\# SKIP\n' ],
  [ 'assert', { ok: true, id: 1, name: 'Not a \\# TODO' } ],
  [ 'line', 'ok 3    Escaped \\\\\\#\n' ],
  [ 'assert', { ok: true, id: 2, name: 'Not a \\# SKIP' } ],
  [ 'assert', { ok: true, id: 3, name: 'Escaped \\\\\\#' } ],
  [ 'complete',
    { ok: true, count: 3, pass: 3, plan: { start: 1, end: 3 } } ] ]
