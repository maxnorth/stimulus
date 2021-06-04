import { EventPipe, DynamicEventPipe } from "./event_pipeline"

export const preventDefaultPipe: EventPipe = {
  name: "preventDefault",
  pipe(event: Event) {
    event.preventDefault()
    return true
  }
}

export const stopPropagationPipe: EventPipe = {
  name: "stopPropagation",
  pipe(event: Event) {
    event.stopPropagation()
    return true
  }
}

export const alphaKeyPipe: DynamicEventPipe<string> = {
  name: "alphaKey",
  priority: 0.3,
  match(pipeId: string) {
    const matches = pipeId.match(/^([a-z])Key$/);
    if (matches) {
      return matches[1]
    }
  },
  pipe(event: Event, alphaChar: string) {
    return (event as KeyboardEvent).code === `Key${alphaChar.toUpperCase()}`
  }
}

const mouseButtonMap: { [key: string]: number } = {
  "left": 0,
  "middle": 1,
  "right": 2
}
export const mouseButtonPipe: DynamicEventPipe<string> = {
  name: "mouseButton",
  priority: 0.2,
  match(pipeId: string) {
    const matches = pipeId.match(/^(left|middle|right)Button$/)
    if (matches) {
      return matches[1]
    }
  },
  pipe(event: Event, button: string) {
    return (event as MouseEvent).button === mouseButtonMap[button]
  }
}

export const modifierKeyPipe: DynamicEventPipe<string> = {
  name: "modifierKey",
  priority: 0.1,
  match(pipeId: string) {
    return /^(ctrl|shift|alt|meta)Key$/.test(pipeId) ? pipeId : undefined
  },
  pipe(event: Event, modifierKey: string) {
    return !!(event as any)[modifierKey]
  }
}

export const defaultEventPipes: (EventPipe | DynamicEventPipe<any>)[] = [
  preventDefaultPipe,
  stopPropagationPipe,
  modifierKeyPipe,
  alphaKeyPipe,
  mouseButtonPipe
]