import t from 'tap'
import { req } from '#require'
import { createRequire } from 'node:module'
const { resolve } = createRequire(import.meta.url)
t.equal(req.resolve('./index.js'), resolve('../dist/mjs/index.js'))
