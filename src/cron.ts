import assert from 'assert'
import { CronJob } from 'cron'
import merge from 'lodash.merge'
import { Job } from 'ymlr/src/components/.job/job'

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
      cron:
        time: 0 0 0 * * *
        scheduled: false          # Start ASAP. Default true
        runOnInit:                # This will immediately fire your onTick function as soon as the requisite initialization has happened. This option is set to false by default for backwards compatibility.
        runs:
          - echo: Executed a job at ${ $parentState.execTime }  # $parentState.time: cron pattern (Date)
                                                                # $parentState.task: Task object
                                                                # $parentState.lastDate: Tells you the last execution date.
                                                                # $parentState.nextDate: Provides the next date that will trigger an onTick.

          - stop:                                               # Stop cron job, dont execute anymore
  ```
*/
export class Cron extends Job {
  time!: string
  scheduled = true
  runOnInit?: boolean
  timezone?: string

  task?: CronJob<any, any>
  private prRunning?: Promise<void>
  private rsRunning?: (_: any) => void

  constructor(props: any) {
    super(props)
    merge(this, props)
  }

  async execJob() {
    assert(this.time)

    this.prRunning = new Promise<void>(resolve => {
      this.rsRunning = resolve
    })

    this.task = new CronJob(this.time, () => {
      this.logger.debug('Execute the task "%s"', this.proxy.name || 'cron')
      const task = this.task
      return this.addJobData({
        task,
        time: this.time,
        get nextDate() {
          return task?.nextDate()
        },
        get lastDate() {
          return task?.lastDate()
        }
      }) as any
    }, () => {
      this.rsRunning?.(undefined)
    }, this.scheduled, this.timezone, undefined, this.runOnInit)

    await this.prRunning
    return []
  }

  async stop() {
    if (!this.task) return
    this.task.stop()
    this.task = undefined
    await this.prRunning
    this.prRunning = this.rsRunning = undefined
  }
}
