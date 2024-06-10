import { type ElementProxy } from 'ymlr/src/components/element-proxy'
import { type Element } from 'ymlr/src/components/element.interface'

export abstract class CronActionAbs implements Element {
  readonly proxy!: ElementProxy<this>

  name?: string[]

  constructor(props: any) {
    if (typeof props === 'string' || Array.isArray(props)) {
      props = {
        name: props
      }
    }
    Object.assign(this, props)
    if (this.name && !Array.isArray(this.name)) {
      this.name = [this.name]
    }
  }

  abstract exec(): any

  dispose() { }
}
