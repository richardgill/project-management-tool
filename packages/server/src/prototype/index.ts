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

  sumOfEstimates(rejectStatuses: Status[]): { [key in EstimateUnit]: number } {
    return {
      [EstimateUnit.DAYS]: _.chain(this.children)
        .map(n => n.sumOfEstimates(rejectStatuses)[EstimateUnit.DAYS])
        .sum()
        .value(),
      [EstimateUnit.STORY_POINTS]: _.chain(this.children)
        .map(n => n.sumOfEstimates(rejectStatuses)[EstimateUnit.STORY_POINTS])
        .sum()
        .value(),
    }
  }

  assignedEstimatedWorkdays(rejectStatuses: Status[]): number {
    return _.chain(this.children)
      .map(n => n.assignedEstimatedWorkdays(rejectStatuses))
      .sum()
      .value()
  }

  unassignedEstimatedWorkdays(fallback: Resource, rejectStatuses: Status[]): number {
    return _.chain(this.children)
      .map(n => n.unassignedEstimatedWorkdays(fallback, rejectStatuses))
      .sum()
      .value()
  }

  totalEstimatedWorkdays(fallback: Resource, rejectStatuses: Status[]): number {
    return this.assignedEstimatedWorkdays(rejectStatuses) + this.unassignedEstimatedWorkdays(fallback, rejectStatuses)
  }

  unfinishedChildren(): (TaskNode | Task)[] {
    return this.children.filter(c => !c.isFinished())
  }

  taskCount(): number {
    return _.chain(this.children)
      .map(n => n.taskCount())
      .sum()
      .value()
  }

  unfinishedTaskCount(): number {
    return _.chain(this.children)
      .map(n => n.unfinishedTaskCount())
      .sum()
      .value()
  }

  isFinished(): boolean {
    return _.every(this.children, c => c.isFinished())
  }

  calculate(fallback: Resource, remainingRejectStatuses: Status[]): Object {
    return {
      ...this,
      children: this.children.map(c => c.calculate(fallback, remainingRejectStatuses)),
      taskCount: this.taskCount(),
      unfinishedTaskCount: this.unfinishedTaskCount(),
      sumOfEstimates: this.sumOfEstimates([]),
      remainingSumOfEstimates: this.sumOfEstimates(remainingRejectStatuses),
      assignedEstimatedWorkdays: this.assignedEstimatedWorkdays([]),
      unassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(fallback, []),
      totalEstimatedWorkdays: this.totalEstimatedWorkdays(fallback, []),
      remainingAssignedEstimatedWorkdays: this.assignedEstimatedWorkdays(remainingRejectStatuses),
      remainingUnassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(fallback, remainingRejectStatuses),
      remainingTotalEstimatedWorkdays: this.totalEstimatedWorkdays(fallback, remainingRejectStatuses),
    }
  }
}

enum Status {
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

enum EstimateUnit {
  DAYS = 'DAYS',
  // HOURS,
  STORY_POINTS = 'STORY_POINTS',
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

  estimatedWorkdays(assignee: Resource, rejectStatuses: Status[]) {
    if (!assignee || rejectStatuses.includes(this.status)) {
      return 0
    }
    return this.estimateNumber / assignee.velocityMappingToCalendarWorkingDay[this.estimateUnit]
  }

  assignedEstimatedWorkdays(rejectStatuses: Status[]) {
    return this.assignee ? this.estimatedWorkdays(this.assignee, rejectStatuses) : 0
  }

  unassignedEstimatedWorkdays(fallbackAssignee: Resource, rejectStatuses: Status[]) {
    return this.assignee ? 0 : this.estimatedWorkdays(fallbackAssignee, rejectStatuses)
  }

  sumOfEstimates(rejectStatuses: Status[]) {
    let result: { [key: string]: number } = {}
    for (const estimateUnit in EstimateUnit) {
      result[estimateUnit] = this.estimateUnit === estimateUnit && !rejectStatuses.includes(this.status) ? this.estimateNumber : 0
    }
    return result
  }

  isFinished(): boolean {
    return this.status === Status.DONE
  }

  unfinishedTaskCount(): number {
    return this.isFinished() ? 0 : 1
  }

  taskCount(): number {
    return 1
  }

  calculate(fallback: Resource): Object {
    return {
      ...this,
      assignedEstimatedWorkdays: this.assignedEstimatedWorkdays([]),
      unassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(fallback, []),
    }
  }
}

// Tree with time left

// Gant chart:

// calendar days missing
// no prioritization (what order do we tackle work)

const averageResource = (resources: Resource[]) => {
  // todo implement properly
  return resources[0]
}

console.log('starting prototype')
// Users
const eoin = new User('enugent', 'Eoin')

// Resources
const yaw = new Resource('Yaw', { [EstimateUnit.DAYS]: 0.4, [EstimateUnit.STORY_POINTS]: 1 })
const richard = new Resource('Richard', { [EstimateUnit.DAYS]: 0.8, [EstimateUnit.STORY_POINTS]: 2 })

const fallbackResource = averageResource([yaw, richard])

// Tree

const connectDocs = new Task('Ungate `klarna_payments`', Status.NOT_STARTED, 2, EstimateUnit.DAYS, yaw, 'Klarna Payments')
const paymentIntentDocs = new Task('PI Docs', Status.IN_REVIEW, 2, EstimateUnit.DAYS, richard, 'Klarna Payments')
const finishTheDocs = new TaskNode('Complete docs', eoin, [connectDocs, paymentIntentDocs], 'Get Klarna docs ready for GA')

const checkoutDogfooding = new Task('Checkout Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.DAYS, richard, 'Checkout Dogfooding')
const piDogfooding = new Task('Payment Intents Dogfooding', Status.DONE, 2, EstimateUnit.STORY_POINTS, richard, 'PI Dogfooding')
const upeDogfooding = new Task('UPE Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.STORY_POINTS)
const dogfooding = new TaskNode('Dogfooding', eoin, [checkoutDogfooding, piDogfooding, upeDogfooding], 'Dogfooding Klarna')

const root = new TaskNode('Klarna GA', eoin, [finishTheDocs, dogfooding], 'Get Klarna to GA')

console.log(JSON.stringify(root.calculate(fallbackResource, [Status.DONE]), null, 2))
