import assert from 'assert'
import { CronJob } from 'cron'
import merge from 'lodash.merge'
import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { type Element } from 'ymlr/src/components/element.interface'
import type Group from 'ymlr/src/components/group'
import { type GroupItemProps, type GroupProps } from 'ymlr/src/components/group/group.props'
import { CronManager } from './cron-manager'

/** |**  cron
  Schedule a task with cron pattern
  ` *     *     *      *       *        * `
  (sec) (min) (hour) (date) (month) (dayOfWeek)

  - `sec`           execution seconds (0-23)
  - `min`           execution minutes (0-23)
  - `hour`          execution hours (0-23)
  - `date`          execution date of month (1-31)
  - `month`         execution month (1-12)
  - `dayOfWeek`     execution day of week (0-7) - 0 or 7 is Sunday, 1 is Monday ...
  @example
  Print a message
  ```yaml
    - name: Schedule a job at 00:00:00 AM
      ymlr-cron:
        time: 0 0 0 * * *
        #times:                                   # Support multple times
        #  - 0 * * * * 1,2                        # Exec at each of minutes of MON, TUE
        #  - 0 0 * * * 3,4,5,6,0                  # Exec each of 00:00 of WED, THU, FRI, SAT, SUN
        scheduled: true
        runs:
          - name: Execute a job 1
        scheduled: false          # Start ASAP. Default true
        runOnInit:                # This will immediately fire your onTick function as soon as the requisite initialization has happened. This option is set to false by default for backwards compatibility.
        runs:
          - echo: Executed a job at ${ $parentState.cronData.execTime }  # $parentState.cronData.time: cron pattern (Date)
                                                                # $parentState.cronData.task: Task object
                                                                # $parentState.cronData.index: Task index (when use multiple times)
                                                                # $parentState.cronData.lastDate: Tells you the last execution date.
                                                                # $parentState.cronData.nextDate: Provides the next date that will trigger an onTick.

          - stop:                                               # Stop cron job, dont execute anymore
  ```
*/

export class Cron implements Element {
  readonly ignoreEvalProps = ['prRunning', 'rsRunning', 'task']
  readonly proxy!: ElementProxy<this>
  readonly innerRunsProxy!: ElementProxy<Group<GroupProps, GroupItemProps>>

  times!: string[]
  scheduled = true
  runOnInit?: boolean
  timezone?: string
  name?: string

  tasks?: Array<CronJob<any, any>>
  private prRunning?: Promise<void>
  private rsRunning?: (_: any) => void
  private isPaused = false

  get logger() {
    return this.proxy.logger
  }

  get isCompleted() {
    return !!this.tasks?.find((task: any) => task.$$done)
  }

  constructor({ time, times = [], ...props }: any) {
    if (time) {
      times.push(time)
    }
    merge(this, { times }, props)
  }

  async exec(parentState?: any) {
    if (this.prRunning) return

    assert(this.times?.length, '"time" or "times" is required')

    if (this.name && CronManager.Instance.has(this.name)) {
      const cron = CronManager.Instance.get(this.name)
      await cron?.exec(parentState) as any
      return []
    }

    this.prRunning = new Promise<void>(resolve => {
      this.rsRunning = resolve
    })

    this.isPaused = !this.scheduled

    this.tasks = this.times.map((time, index) => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const job = new CronJob(time, async () => {
        const task = this.tasks?.[index]
        if (!task) return
        this.logger.debug('Executing the task "%s" at %s', this.name || this.proxy.name, task?.lastDate()?.toString())
        await this.innerRunsProxy.exec({
          ...parentState,
          cronData: {
            task,
            index,
            time,
            get nextDate() {
              return task?.nextDate()
            },
            get lastDate() {
              return task?.lastDate()
            }
          }
        })
        this.logger.debug('Next task "%s" at %s', this.name, task?.nextDate().toString())
      }, () => {
        const task: any = this.tasks?.[index]
        if (task) {
          task.$$done = true
        }
        if (!this.isPaused && this.isCompleted) {
          this.rsRunning?.(undefined)
        }
      }, this.scheduled, this.timezone, undefined, this.runOnInit)
      return job
    })

    if (this.name) {
      CronManager.Instance.set(this.name, this)
    }

    if (this.scheduled) {
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      const nextJobTime = this.tasks?.map(task => task.nextDate().millisecond).sort()[0]
      if (nextJobTime) {
        this.logger.debug('Start the first task "%s" at %s', this.name, new Date(nextJobTime).toString())
      }
    }

    await this.prRunning
    return []
  }

  async pause() {
    this.isPaused = true
    this.tasks?.forEach(task => {
      task.stop()
    })
  }

  async resume() {
    this.isPaused = false
    this.tasks?.forEach(task => {
      task.start()
    })
  }

  async stop() {
    if (!this.tasks?.length) return
    if (this.isPaused) {
      this.isPaused = false
      this.rsRunning?.(undefined)
    } else {
      this.tasks?.forEach(task => {
        task.stop()
      })
    }
    await this.prRunning
    this.logger.debug('Stoped')
    this.tasks = undefined
    this.prRunning = this.rsRunning = undefined
    if (this.name) {
      CronManager.Instance.delete(this.name)
    }
  }

  async dispose() {
    await this.stop()
  }
}
