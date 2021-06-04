export interface EventPipe {
  name: string
  pipe: (event: Event) => boolean
}

export interface DynamicEventPipe<TMatchResult> {
  name: string
  priority?: number
  match: (id: string) => TMatchResult | undefined
  pipe: (event: Event, matchResult: TMatchResult) => boolean
}

type PipeReference = { pipe: (event: Event, matchResult: any) => boolean, matchResult?: any }

export class EventPipeline {

  private simplePipes: { [key: string]: EventPipe }
  private dynamicPipes: DynamicEventPipe<any>[]

  constructor(initialPipes: (EventPipe | DynamicEventPipe<any>)[]) {
    this.simplePipes = {}
    this.dynamicPipes = []
    this.addPipes(initialPipes)
  }

  runPipeSequence(event: Event, pipeNames: string[]): boolean {
    this.sortDynamicPipesByPriority()
    for (const name of pipeNames) {
      const { pipe, matchResult } = this.getPipe(name)
      try {
        if (!pipe(event, matchResult)) {
          return false
        }
      }
      catch {
        console.warn("error found while using pipe. *** need to log this to context")
      }
    }
    return true
  }

  private sortDynamicPipesByPriority() {
    this.dynamicPipes.sort((left, right) => {
      const leftPriority = getPipePriority(left), rightPriority = getPipePriority(right)
      return leftPriority > rightPriority ? -1 : leftPriority < rightPriority ? 1 : 0
    })
  }

  private getPipe(pipeId: string): PipeReference {
    const foundSimplePipe = this.simplePipes[pipeId]
    if (foundSimplePipe) {
      return { pipe: foundSimplePipe.pipe, matchResult: undefined }
    }

    for (const dynamicPipe of this.dynamicPipes) {
      const matchResult = dynamicPipe.match(pipeId), pipe = dynamicPipe.pipe
      if (matchResult !== undefined) {
        return { pipe, matchResult }
      }
    }

    throw new Error(`No event pipes found matching id '${pipeId}'`)
  }

  addPipes(pipes: (EventPipe|DynamicEventPipe<any>)[]): void {
    for (const pipe of pipes) {
      if ("match" in pipe) {
        this.dynamicPipes.push(pipe)
      }
      else {
        this.simplePipes[pipe.name] = pipe
      }
    }
  }

  removePipe(name: string) {
    delete this.simplePipes[name]
    this.dynamicPipes = this.dynamicPipes.filter(pipe => pipe.name !== name)
  }

  clearPipes() {
    this.simplePipes = {}
    this.dynamicPipes = []
  }
}

function getPipePriority({ priority }: DynamicEventPipe<any>): number {
  return typeof priority === "number" ? priority : 1
}