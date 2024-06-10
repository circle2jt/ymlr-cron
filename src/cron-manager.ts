import { UtilityFunctionManager } from 'ymlr/src/managers/utility-function-manager'
import { type Cron } from './cron'

export class CronManager extends Map<string, Cron> {
  static #Instance: CronManager

  static get Instance() {
    if (!this.#Instance) {
      const instance = this.#Instance = new CronManager()
      Object.defineProperty(UtilityFunctionManager.Instance, 'cronManager', {
        get() {
          return instance
        }
      })
    }
    return this.#Instance
  }

  async remove(name: string) {
    await this.get(name)?.stop()
    return super.delete(name)
  }
}
