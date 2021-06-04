import { EventPipelineTestCase } from "../event_pipeline_test_case"

export default class EventPipelineTests extends EventPipelineTestCase {
  identifier = "c"
  fixtureHTML = `
    <div data-controller="c">
      <button id="passing" data-action="click|pass->c#log"></button>
      <button id="blocking" data-action="click|block->c#log"></button>
      <button id="multiple" data-action="click|first|second|third|fourth->c#log click|fourth|third|second|first->c#log2"></button>
      <button id="priority" data-action="click|prioritized->c#log"></button>
    </div>
  `

  async "test passing pipe invokes action"() {
    this.addPipe("pass")
    await this.triggerEvent("#passing", "click")
    this.assertActions({ eventType: "click", currentTarget: this.findElement("#passing")  })
  }

  async "test blocking pipe prevents action"() {
    this.addPipe("block", () => false)
    await this.triggerEvent("#blocking", "click")
    this.assertNoActions()
  }

  async "test unknown pipe logs error and prevents action"() {
    await this.triggerEvent("#passing", "click")
    this.assert.equal(this.application.eventPipelineErrors.length, 1) // TODO enhance
    this.assertNoActions()
  }

  async "test all pipes can be removed"() {    
    this.addPipe("first") 
    this.addPipe("second") 
    this.addDynamicPipe("thirdOrFourthPipes", /^third|fourth$/)
    
    await this.triggerEvent("#multiple", "click")
    this.assertActions(
      { name: "log", eventType: "click", currentTarget: this.findElement("#multiple") },
      { name: "log2", eventType: "click", currentTarget: this.findElement("#multiple") })

    this.clearActionLog()
    this.eventPipeline.clearPipes()

    await this.triggerEvent("#multiple", "click")
    this.assertNoActions()
  }

  async "test individual pipes can be removed"() {
    this.addPipe("first") 
    this.addPipe("second") 
    this.addDynamicPipe("thirdOrFourthPipes", /^third|fourth$/)
    await this.triggerEvent("#multiple", "click")
    this.assertActions({ eventType: "click", currentTarget: this.findElement("#multiple")  })

    this.clearActionLog()
    this.eventPipeline.removePipe("second")

    await this.triggerEvent("#multiple", "click")
    this.assertNoActions()
    this.assert.ok(this.application.eventPipelineErrors.find(x => x.error.message == "No event pipes found matching id 'second'"))
  }

  async "test simple pipes are prioritized over dynamic pipes"() {
    let matchedPipe = "none"
    this.addDynamicPipe("any", /.+/, () => (matchedPipe = "dynamic", true))
    this.addPipe("prioritized", () => (matchedPipe = "simple", true))
    
    await this.triggerEvent("#priority", "click")
    this.assertActions({ eventType: "click", currentTarget: this.findElement("#priority")  })
    this.assert.equal(matchedPipe, "simple")
  }

  async "test dynamic pipe matching prefers higher 'priority' property"() {
    let matchedPipe = "none"
    this.addDynamicPipe("generic", /.+/, () => (matchedPipe = "generic", true), 2)
    this.addDynamicPipe("specific", /^prioritized$/, () => (matchedPipe = "specific", true), 3)
    
    await this.triggerEvent("#priority", "click")
    this.assertActions({ eventType: "click", currentTarget: this.findElement("#priority")  })
    this.assert.equal(matchedPipe, "specific")
  }
  
  async "test dynamic pipe matching prefers first registered when 'priority' is equal"() {
    let matchedPipe = "none"
    this.addDynamicPipe("generic", /.+/, () => (matchedPipe = "generic", true), 2)
    this.addDynamicPipe("specific", /^prioritized$/, () => (matchedPipe = "specific", true), 2)
    
    await this.triggerEvent("#priority", "click")
    this.assertActions({ eventType: "click", currentTarget: this.findElement("#priority")  })
    this.assert.equal(matchedPipe, "generic")
  }
}