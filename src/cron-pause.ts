import { CronActionAbs } from './cron-action.abstract'
import { CronManager } from './cron-manager'

/** |**  cron'pause
  Pause a running cron job

  @example
  ```yaml
    - name: Schedule a job                       # Create a cron job "cron01" and shedule it
      ~ymlr-cron:
        name: cron01
        time: 0 * * * * *
        scheduled: true
        runs:
          - name: Execute a job 1

    - ~runs:
        - ymlr-cron'pause: cron01                # Pause it but keep it in cached to resume later
        - sleep: 10s
        - ymlr-cron'resume: cron01               # Resume it after 10s
  ```
*/
export class CronPause extends CronActionAbs {
  async exec() {
    if (this.name?.length) {
      return await Promise.all(this.name.map(async name => {
        this.proxy.logger.debug(`Paused cron ${name}`)
        return await CronManager.Instance.get(name)?.pause()
      }))
    }
  }
}
