export interface SimpleEventPipe {
    name: string
    pipe: (event: Event) => Event|undefined
}

export interface DynamicEventPipe<TEvent extends Event, TMatchResult> {
    name: string
    match: (id: string) => TMatchResult|undefined
    pipe: (event: TEvent, matchResult: TMatchResult) => TEvent|undefined
}

type PipeHandler = { pipe: (event: Event, matchResult: any) => Event|undefined, matchResult?: any }

export class EventPipeline {

    private readonly staticPipes: { [key: string]: SimpleEventPipe } = {}
    private readonly dynamicPipes: DynamicEventPipe<Event, any>[] = []
    private readonly cachedDynamicPipes: { [key: string]: PipeHandler } = {}
    
    constructor(initialStaticPipes: SimpleEventPipe[], initialDynamicPipes: DynamicEventPipe<Event, any>[]) {
        this.staticPipes = {}
        for (const staticPipe of initialStaticPipes) {
            this.staticPipes[staticPipe.name] = staticPipe
        }
        this.dynamicPipes = initialDynamicPipes || []
    }

    run(event: Event, pipeIds: string[]) {
        for (const pipeId of pipeIds) {
            const { pipe, matchResult } = this.getPipe(pipeId)
            try {
                if (event !== pipe(event, matchResult)) {
                    return undefined
                }
            }
            catch {
                console.warn("error found while using pipe. *** need to log this to context")
            }
        }
        return event
    }

    private getPipe(pipeId: string): PipeHandler {

        let foundSimplePipe = this.staticPipes[pipeId]
        if (foundSimplePipe) {
            return { pipe: foundSimplePipe.pipe, matchResult: undefined }
        }

        let foundCachedDynamicPipe = this.cachedDynamicPipes[pipeId]
        if (foundCachedDynamicPipe) {
            return foundCachedDynamicPipe
        }

        for (let dynamicPipe of this.dynamicPipes) {
            let matchResult = dynamicPipe.match(pipeId), pipe = dynamicPipe.pipe
            if (matchResult !== undefined) {
                return this.cachedDynamicPipes[pipeId] = { pipe,  matchResult }
            }
        }

        throw new Error(`No event pipes found matching id '${pipeId}'`)
    }
}