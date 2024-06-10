import { CronActionAbs } from './cron-action.abstract'
import { CronManager } from './cron-manager'

/** |**  cron'del
  Stop a running cron job and delete it in cached

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
        - ymlr-cron'del: cron01                # Pause and remove it in cached. After this, the cron task will be finished to keep playing the next steps

    - name: cron job has been stoped !
  ```
*/
export class CronDelete extends CronActionAbs {
  async exec() {
    if (this.name?.length) {
      return await Promise.all(this.name.map(async name => {
        this.proxy.logger.debug(`Deleted cron ${name}`)
        return await CronManager.Instance.remove(name)
      }))
    }
  }
}
