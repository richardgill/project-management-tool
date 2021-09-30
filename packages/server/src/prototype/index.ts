import _ from 'lodash'

class User {
  handle: string
  name: string

  constructor(handle: string, name: string) {
    this.handle = handle
    this.name = name
  }
}

class Resource {
  name: string
  // calendar:
  velocityMappingToCalendarWorkingDay: { [key in EstimateUnit]: number }

  constructor(name: string, velocityMappingToCalendarWorkingDay: { [key in EstimateUnit]: number }) {
    this.name = name
    this.velocityMappingToCalendarWorkingDay = velocityMappingToCalendarWorkingDay
  }
}

class TaskNode {
  title: string
  description?: string
  children: (TaskNode | Task)[]
  owner: User

  constructor(title: string, owner: User, children: (TaskNode | Task)[], description?: string) {
    this.title = title
    this.children = children
    this.owner = owner
    this.description = description
  }

  sumOfEstimates(): { [key in EstimateUnit]: number } {
    return {
      [EstimateUnit.DAYS]: _.chain(this.children)
        .map(n => n.sumOfEstimates()[EstimateUnit.DAYS])
        .sum()
        .value(),
      [EstimateUnit.STORY_POINTS]: _.chain(this.children)
        .map(n => n.sumOfEstimates()[EstimateUnit.STORY_POINTS])
        .sum()
        .value(),
    }
  }

  estimatedWorkdays(): number {
    return _.chain(this.children)
      .map(n => n.estimatedWorkdays())
      .sum()
      .value()
  }

  toObject(): Object {
    return {
      ...this,
      children: this.children.map(c => c.toObject()),
      sumOfEstimates: this.sumOfEstimates(),
      estimatedWorkdays: this.estimatedWorkdays(),
    }
  }
}

enum Status {
  NOT_STARTED,
  STARTED,
  IN_REVIEW,
  DONE,
}

enum EstimateUnit {
  DAYS,
  // HOURS,
  STORY_POINTS,
}

class Task {
  title: string
  description?: string
  status: Status
  estimateNumber: number // e.g 7
  estimateUnit: EstimateUnit // e.g. story points
  assignee?: Resource

  constructor(title: string, status: Status, estimateNumber: number, estimateUnit: EstimateUnit, assignee?: Resource, description?: string) {
    this.title = title
    this.status = status
    this.estimateNumber = estimateNumber
    this.estimateUnit = estimateUnit
    this.assignee = assignee
    this.description = description
  }

  estimatedWorkdays() {
    return this.estimateNumber / this.assignee.velocityMappingToCalendarWorkingDay[this.estimateUnit]
  }

  sumOfEstimates() {
    return {
      [EstimateUnit.DAYS]: this.estimateUnit === EstimateUnit.DAYS ? this.estimateNumber : 0,
      [EstimateUnit.STORY_POINTS]: this.estimateUnit === EstimateUnit.STORY_POINTS ? this.estimateNumber : 0,
    }
  }

  toObject(): Object {
    return {
      ...this,
      estimatedWorkdays: this.estimatedWorkdays(),
    }
  }
}

// Tree with time left

// Gant chart:

// calendar days missing
// no prioritization (what order do we tackle work)

console.log('starting prototype')

const eoin = new User('enugent', 'Eoin')
const yaw = new Resource('Yaw', { [EstimateUnit.DAYS]: 0.4, [EstimateUnit.STORY_POINTS]: 1 })
const richard = new Resource('Richard', { [EstimateUnit.DAYS]: 0.8, [EstimateUnit.STORY_POINTS]: 2 })

const connectDocs = new Task('Ungate `klarna_payments`', Status.NOT_STARTED, 2, EstimateUnit.DAYS, yaw, 'Klarna Payments')
const paymentIntentDocs = new Task('PI Docs', Status.NOT_STARTED, 2, EstimateUnit.DAYS, richard, 'Klarna Payments')
const finishTheDocs = new TaskNode('Complete docs', eoin, [connectDocs, paymentIntentDocs], 'Get Klarna docs ready for GA')

const checkoutDogfooding = new Task('Checkout Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.DAYS, richard, 'Checkout Dogfooding')
const piDogfooding = new Task('Payment Intents Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.STORY_POINTS, richard, 'PI Dogfooding')
const dogfooding = new TaskNode('Dogfooding', eoin, [checkoutDogfooding, piDogfooding], 'Dogfooding Klarna')
const root = new TaskNode('Klarna GA', eoin, [finishTheDocs, dogfooding], 'Get Klarna to GA')

console.log(JSON.stringify(root.toObject(), null, 2))
