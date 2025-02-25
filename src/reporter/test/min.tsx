import chalk from './fixtures/chalk.js'

import { LoadedConfig } from '@tapjs/config'
import { Box, Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'
import t from 'tap'
import { getTest } from './fixtures/get-test.js'

const config = {} as unknown as LoadedConfig

const { Min } = (await t.mockImport('../dist/esm/min.js', {
  chalk,
  '../dist/esm/ms.js': {
    ms: () => '{TIME}',
  },
  '../dist/esm/hooks/use-test-time.js': {
    useTestTime: () => 123,
  },
  '../dist/esm/stack.js': {
    Stack: () => (
      <Box>
        <Text>{'XXX mock stack XXX'}</Text>
      </Box>
    ),
  },
})) as typeof import('../dist/esm/min.js')

t.test('no comments or passes', async t => {
  const tb = getTest()
  const app = render(<Min config={config} test={tb} />)
  tb.go()
  await tb.concat()
  t.matchSnapshot(app.lastFrame())
})

t.test('yes comments and passes', async t => {
  const tb = getTest()
  const app = render(<Min config={config} test={tb} />)
  tb.go()
  await tb.concat()
  t.matchSnapshot(app.lastFrame())
})
