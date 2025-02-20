import { builtinModules } from 'node:module'
import { resolve } from 'node:path'
import { CallSiteLike } from './call-site-like.js'
import { requireResolve } from './require-resolve.js'
export { CallSiteLike, CallSiteLikeJSON } from './call-site-like.js'
export type { GeneratedResult } from './call-site-like.js'
export type { Compiled, LineRef } from './parse.js'

const regExpEscape = (s: string) =>
  s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

// platform portability accommodation
/* c8 ignore start */
let cwd =
  typeof process === 'object' &&
  process &&
  typeof process.cwd === 'function'
    ? process.cwd()
    : undefined
/* c8 ignore stop */

/**
 * Set the effective cwd for shortening filenames in stack traces
 * Set to `undefined` to show full absolute paths.
 */
export const setCwd = (c: string | undefined) => (cwd = c)

/**
 * Get the effective cwd for shortening filenames in stack traces
 * If set to `undefined`, then will show full absolute paths.
 */
export const getCwd = () => cwd

let filterNodeInternals = true
/**
 * Get the current value indicating whether node internals should be
 * filtered out. (Defaults to true)
 */
export const getFilterNodeInternals = () => filterNodeInternals
/**
 * Set whether node internals should be filtered out.
 */
export const setFilterNodeInternals = (s: boolean) =>
  (filterNodeInternals = s)

// these are packages that function somewhat like node internals,
// for tap's purposes, and `@tapjs` packages themselves, when loaded
// from node_modules.
const ignoredPackages: string[] = [
  '@tapjs',
  '@isaacs/ts-node-temp-fork-for-pr-2009',
  'pirates',
  'function-loop',
  '@cspotcode/source-map-support',
  'signal-exit',
  'async-hook-domain',
]
let dirty: boolean = false

/**
 * Add a package name to the list of deps that should be excluded
 * from stack traces.
 */
export const addIgnoredPackage = (s: string) => {
  const i = ignoredPackages.indexOf(s)
  if (i === -1) {
    ignoredPackages.push(s)
    dirty = true
  }
}

/**
 * Remove a package name from the list of deps that should be excluded
 * from stack traces.
 */
export const removeIgnoredPackage = (s: string) => {
  const i = ignoredPackages.indexOf(s)
  if (i !== -1) {
    ignoredPackages.splice(i, 1)
    dirty = true
  }
}

/**
 * Get a read-only copy of the list of deps that should be excluded
 * from stack traces.
 */
export const getIgnoredPackages = () =>
  Object.freeze(ignoredPackages.slice(0))

const getTestBuiltPath = () => {
  const p = requireResolve('@tapjs/test')
  // we'll always find the test class in this project
  /* c8 ignore start */
  if (!p) return ''
  /* c8 ignore stop */
  return resolve(p, '../../../test-built')
}

const buildIgnoredPackages = () => {
  // just a safety precaution, no reason to ever do this
  /* c8 ignore start */
  if (!ignoredPackages.length) return undefined
  /* c8 ignore stop */
  const p = ignoredPackages.map(s => regExpEscape(s)).join('|')
  const nm = `[/\\\\]node_modules[/\\\\](?:${p})([/\\\\]|$)`
  // if we are ignoring @tapjs/test, then also ignore its built
  // plugged-in implementation. This is only relevant when developing
  // this project, or other cases where @tapjs/test may be linked,
  // because when it's loaded from node_modules, it'll be excluded
  // by virtue of being in that folder anyhow.
  const built =
    ignoredPackages.includes('@tapjs') ||
    ignoredPackages.includes('@tapjs/test')
      ? getTestBuiltPath()
      : ''
  const re = built ? `${built}([/\\\\].*|$)|${nm}` : nm
  return new RegExp(re)
}

/**
 * exported for testing, no real purpose, but also no harm in looking
 */
export const getIgnoredPackagesRE = () =>
  !dirty
    ? ignoredPackagesRE
    : (ignoredPackagesRE = buildIgnoredPackages())

let ignoredPackagesRE: RegExp | undefined = buildIgnoredPackages()
let filterIgnoredPackages = true

/**
 * Set whether or not the list of ignored packages should
 * be excluded from stack traces.
 */
export const setFilterIgnoredPackages = (s: boolean) =>
  (filterIgnoredPackages = s)

/**
 * Get whether or not the list of ignored packages should
 * be excluded from stack traces.
 */
export const getFilterIgnoredPackages = () => filterIgnoredPackages

// detect the first line of Error.stack, 'Error: blah'
const isErrorStackHead = (c?: CallSiteLike): boolean =>
  !!c &&
  c.lineNumber === null &&
  c.columnNumber === null &&
  c.this === undefined &&
  c.evalOrigin === undefined &&
  c.function === undefined &&
  c.typeName === null &&
  c.methodName === null &&
  (typeof c.functionName === 'string' || !c.functionName) &&
  c.isEval === false &&
  c.isNative === false &&
  c.isToplevel === false &&
  c.isConstructor === false &&
  c.generated === undefined

const filter = (c: CallSiteLike): boolean => {
  const s = c.fileName
  // technically this is possible, but super unlikely
  /* c8 ignore start */
  if (!s) return true
  /* c8 ignore stop */
  if (dirty && filterIgnoredPackages) {
    ignoredPackagesRE = buildIgnoredPackages()
    dirty = false
  }
  return (
    (!filterNodeInternals ||
      !(s.startsWith('node:') || builtinModules.includes(s))) &&
    (!filterIgnoredPackages || !ignoredPackagesRE?.test(s))
  )
}

const clean = (c: CallSiteLike[]): CallSiteLike[] => {
  const filtered = c.filter(filter)
  while (isErrorStackHead(filtered[0])) filtered.shift()
  if (cwd !== undefined) {
    for (const c of filtered) {
      c.cwd = cwd
    }
  }
  return filtered
}

let capturing = false
/**
 * Get an array of {@link @tapjs/stack!call-site-like.CallSiteLike} objects for
 * the current location, from the call to the `fn` argument supplied, limited
 * to the number of frames specified by `limit`.
 *
 * If the `limit` argument is 0, then the current `Error.stackTraceLimit`
 * value will be used.
 *
 * This method is not re-entry safe, due to the fact that it relies on
 * temporarily overriding the global Error.prepareStackTrace. As a result,
 * if a capture() is triggered in any of the methods used by the
 * CallSiteLike constructor (for example, if `@tapjs/intercept` is used to
 * capture the process.cwd() method, which is used by path.resolve()),
 * then that will cause problems. To work around this, if a re-entry is
 * detected, then an empty stack of [] is returned.
 *
 * Even if it was made re-entry safe, it would be easy to accidentally
 * trigger an infinite recursion and stack overflow in such a scenario, so
 * returning an empty stack in the case of re-entry is the best workaround.
 */
export function capture(
  limit: number,
  fn: Function | ((...a: any[]) => any)
): CallSiteLike[]
export function capture(limit: number): CallSiteLike[]
export function capture(
  fn: Function | ((...a: any[]) => any)
): CallSiteLike[]
export function capture(): CallSiteLike[]
export function capture(
  limit: number | Function | ((...a: any[]) => any) = 0,
  fn: Function | ((...a: any[]) => any) = capture
): CallSiteLike[] {
  // should be impossible to hit, but can if we have to look up
  // a sourcemap for a file we haven't seen before, and the filename
  // happens to come through as a url or relative path.
  /* c8 ignore start */
  if (capturing) return []
  /* c8 ignore stop */
  capturing = true
  if (typeof limit === 'function') {
    fn = limit
    limit = 0
  }
  const { prepareStackTrace, stackTraceLimit } = Error
  Error.prepareStackTrace = CallSiteLike.prepareStackTrace
  if (limit) {
    // we always get an extra few frames to account for internals
    // or proxy frames that might be filtered out of the top.
    Error.stackTraceLimit = limit + 10
  }
  const obj: { stack: CallSiteLike[] } = { stack: [] }
  Error.captureStackTrace(obj, fn)
  const { stack } = obj
  Object.assign(Error, { prepareStackTrace, stackTraceLimit })
  const st = clean(stack)
  capturing = false
  return limit === 0 ? st : st.slice(0, limit)
}

/**
 * Get the call site in the stack either where `at()` is called, or
 * where the supplied `fn` function is called.
 *
 * If `fn` is provided, and is not in the current call stack, then
 * `undefined` will be returned.
 */
export const at: (
  fn?: Function | ((...a: any[]) => any)
) => CallSiteLike | undefined = (fn = at) => {
  const [site] = capture(1, fn)
  return site
}

/**
 * Same as {@link @tapjs/stack!index.capture}, but return the `toString()`
 * values of the {@link @tapjs/stack!call-site-like.CallSiteLike} objects
 */
export function captureString(
  limit: number,
  fn: Function | ((...a: any[]) => any)
): string
export function captureString(limit: number): string
export function captureString(
  fn?: Function | ((...a: any[]) => any)
): string
export function captureString(): string
export function captureString(
  limit: number | Function | ((...a: any[]) => any) = Infinity,
  fn: Function | ((...a: any[]) => any) = captureString
): string {
  if (typeof limit === 'function') {
    fn = limit
    limit = 0
  }
  const stack = capture(limit, fn)
  return (limit === 0 ? stack : stack.slice(0, limit))
    .map(c => String(c) + '\n')
    .join('')
}

/**
 * Get an array of {@link CallSiteLike} objects corresponding to the stack
 * trace of the Error object provided.
 *
 * This does _not_ actually look at the current call site, or do anything
 * magical with the V8 engine. It's just parsing a string.
 *
 * While some effort is made to interpret stacks correctly when an Error
 * contains a `name` and `message`, remember that the `Error.stack` property in
 * JavaScript is remarkably sloppy. In some cases, if the `Error.message`
 * contains `\n` and some lines after the first look like stack trace lines,
 * incorrect data may result. It's only as good as the stack you pass to it.
 */
export const captureError = (
  e: Error | NodeJS.ErrnoException
): CallSiteLike[] => {
  // errors almost always have these fields
  const {
    stack = '',
    message = '',
    name = '',
    code,
  } = e as NodeJS.ErrnoException
  const head = name && message ? `${name}: ${message}\n` : ''
  const errnoHead =
    name && message && code ? `${name} [${code}]: ${message}` : ''
  const cleanHead = !!head && stack.startsWith(head)
  const cleanErrnoHead = !!errnoHead && stack.startsWith(errnoHead)

  const s = cleanHead
    ? stack.substring(head.length)
    : cleanErrnoHead
    ? stack.substring(errnoHead.length)
    : stack
  const cleaned = clean(
    s
      .trimEnd()
      .split('\n')
      .filter(l => !!l)
      .map(line => new CallSiteLike(e, line))
  )
  // if we didn't clean the header cleanly, then sweep the stack for
  // any weird junk it might contain
  return cleanHead
    ? cleaned
    : cleaned.filter(c => !isErrorStackHead(c))
}

/**
 * Get a processed string stack corresponding to the stack trace of the Error
 * object provided.
 *
 * This method has all the same caveats as {@link captureError}. If the
 * object provided has a weird looking `stack` property, then you might get
 * weird results.
 */
export const captureErrorString = (e: Error): string =>
  captureError(e)
    .map(c => String(c) + '\n')
    .join('')

/**
 * Parse a stack string and return an array of CallSiteLike objects
 *
 * We use this to get the `at` diagnostic callsite when all we have is
 * a stack, either from a native Error object, or a stringified CallSiteLike
 * stack.
 */
export const parseStack = (s: string): CallSiteLike[] =>
  clean(
    s
      .trimEnd()
      .split('\n')
      .filter(l => !!l.trim())
      .map(line => new CallSiteLike(null, line))
  )

export const expandStack = (s?: string | CallSiteLike[]): string => {
  if (!s) return ''
  if (typeof s === 'string') return expandStack(parseStack(s))
  return clean(s)
    .map(c => c.toString(true) + '\n')
    .join('')
}
