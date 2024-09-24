import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { Testing } from 'ymlr/src/testing'
import { Cron } from './cron'

let cron: ElementProxy<Cron>

beforeEach(async () => {
  await Testing.reset()
})

afterEach(async () => {
  await cron.dispose()
})

test('Test simple cron each 1 sec', async () => {
  Testing.vars.ok = false
  cron = await Testing.createElementProxy(Cron, {
    time: '* * * * * *',
    scheduled: true
  }, {
    runs: [
      {
        vars: {
          ok: true,
          lastDate: '${ $parentState.cronData.lastDate }'
        }
      }, {
        stop: null
      }
    ]
  })
  await cron.exec()
  expect(Testing.vars.ok).toBe(true)
  expect(Testing.vars.lastDate).toBeInstanceOf(Date)
})

test('Test cron with multiple times', async () => {
  Testing.vars.idx = new Set()
  cron = await Testing.createElementProxy(Cron, {
    times: [
      '*/3 * * * * *',
      '*/4 * * * * *'
    ],
    scheduled: true,
    runOnInit: false
  }, {
    runs: [
      {
        js: '$vars.idx.add($parentState.cronData.index)'
      }
    ]
  })
  setTimeout(() => {
    void cron.dispose()
  }, 5000)
  await cron.exec()
  expect(Testing.vars.idx).toContain(0)
  expect(Testing.vars.idx).toContain(1)
})
