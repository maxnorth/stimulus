import { LogControllerTestCase } from "./log_controller_test_case";
import { Application } from "..";

class EventPipelineTestApplication extends Application {
  eventPipelineErrors: { error: Error, message: string, detail: object }[] = []
  handleError(error: Error, message: string, detail: object) {
    if (message.startsWith("Error running event pipe sequence")) {
      this.eventPipelineErrors.push({ error, message, detail })
    }
    else {
      throw error
    }
  }
}

export class EventPipelineTestCase extends LogControllerTestCase {
  application = new EventPipelineTestApplication()
  
  addPipe(name: string, pipe: (event: Event) => boolean = () => true) {
    this.application.eventPipeline.addPipes([{ name, pipe }])
  }

  addDynamicPipe(name: string, matchRegex: RegExp, pipe: (event: Event, name: string) => boolean = (event) => true, priority = 1) {
    function match(name: string) {
      return matchRegex.test(name) ? name : undefined
    }
    this.application.eventPipeline.addPipes([{ name, priority, match, pipe }])
  }

  get eventPipeline() {
    return this.application.eventPipeline
  }

  // TODO error logging
}