import { SimpleEventPipe, DynamicEventPipe } from "./event_pipeline"

export const preventDefaultPipe: SimpleEventPipe = {
    name: "preventDefault",
    pipe(event: Event) {
        event.preventDefault()
        return event
    }
}

const keyMap: { [key: string]: number } = {
    "a": 65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, 
    "h": 72, "i": 73, "j": 74, "k": 75, 
    "l": 76, "m": 77, "n": 78, "o": 79, "p": 80, 
    "q": 81, "r": 82, "s": 83, "t": 84, "u": 85, "v": 86, 
    "w": 87, "x": 88, "y": 89, "z": 90
}
export const alphaKeysPipe: DynamicEventPipe<KeyboardEvent, string> = {
    name: "alphaKeys",
    match(pipeId: string) {
        let matchGroups = pipeId.match(/^(key[A-Z])$/);
        if (matchGroups) {
            return matchGroups[1].toLowerCase()
        }
    },
    pipe(event: KeyboardEvent, key: string) {
        if (event.keyCode === keyMap[key]) {
            return event;
        }
    }
}

export const modifierKeysPipe: DynamicEventPipe<UIEvent, string> = {
    name: "modifierKeys",
    match(pipeId: string) {
        return pipeId.match(/^(ctrl|shift|alt|meta)Key$/) ? pipeId : undefined
    },
    pipe(event: UIEvent, modifierKey: string) {
        return (event as any)[modifierKey] ? event : undefined
    }
}

export const defaultStaticPipes: SimpleEventPipe[] = [
    preventDefaultPipe
]
export const defaultDynamicPipes: DynamicEventPipe<any, any>[] = [
    modifierKeysPipe,
    alphaKeysPipe
]