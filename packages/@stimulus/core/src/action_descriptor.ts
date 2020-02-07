export interface ActionDescriptor {
  eventTarget: EventTarget
  eventOptions: AddEventListenerOptions
  eventName: string,
  eventPipeNames: string[],
  identifier: string
  methodName: string
}

// capture nos.:            12   23 4               43 5  6  65   1 7   78 9      98a b  ba    a=10, b=11
const descriptorPattern = /^((.+?)(@(window|document))?(\|(.+))?->)?(.+?)(#([^:]+?))(:(.+))?$/

export function parseDescriptorString(descriptorString: string): Partial<ActionDescriptor> {
  const source = descriptorString.trim()
  const matches = source.match(descriptorPattern) || []
  return {
    eventTarget:    parseEventTarget(matches[4]),
    eventName:      matches[2],
    eventPipeNames: matches[6] ? parseEventPipeNames(matches[6]) : [],
    eventOptions:   matches[11] ? parseEventOptions(matches[11]) : {},
    identifier:     matches[7],
    methodName:     matches[9]
  }
}

function parseEventTarget(eventTargetName: string): EventTarget | undefined {
  if (eventTargetName == "window") {
    return window
  } else if (eventTargetName == "document") {
    return document
  }
}

function parseEventPipeNames(eventModiferNames: string) {
  return eventModiferNames.split("|").map(name => name.trim())
}

function parseEventOptions(eventOptions: string): AddEventListenerOptions {
  return eventOptions.split(":").reduce((options, token) =>
    Object.assign(options, { [token.replace(/^!/, "")]: !/^!/.test(token) })
  , {})
}

export function stringifyEventTarget(eventTarget: EventTarget) {
  if (eventTarget == window) {
    return "window"
  } else if (eventTarget == document) {
    return "document"
  }
}
