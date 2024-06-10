import { CronActionAbs } from './cron-action.abstract'
import { CronManager } from './cron-manager'

/** |**  cron'resume
  Resume a pausing cron job

  @example
  ```yaml
    - name: Schedule a job                       # Create a cron job "cron01" but not run yet
      ~ymlr-cron:
        name: cron01
        time: 0 * * * * *
        scheduled: false
        runs:
          - name: Execute a job 1

    - ~runs:
        - sleep: 5s                               # sleep 5s before start "cron01"
        - ymlr-cron'resume: cron01
  ```
*/
export class CronResume extends CronActionAbs {
  async exec() {
    if (this.name?.length) {
      return await Promise.all(this.name.map(async name => {
        this.proxy.logger.debug(`Resumed cron ${name}`)
        return await CronManager.Instance.get(name)?.resume()
      }))
    }
  }
}
