/* eslint-disable max-classes-per-file */

import _ from 'lodash'

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

  sumOfEstimates(rejectStatuses: Status[]): { [key: string]: number } {
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => [
        estimateUnit,
        _.chain(this.children)
          .map(n => n.sumOfEstimates(rejectStatuses)[estimateUnit])
          .sum()
          .value(),
      ])
      .fromPairs()
      .value()
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

  taskCount(rejectStatuses: Status[] = []): number {
    return _.chain(this.children)
      .map(n => n.taskCount(rejectStatuses))
      .sum()
      .value()
  }

  calculate(fallback: Resource, remainingRejectStatuses: Status[]): Object {
    return {
      ...this,
      children: this.children.map(c => c.calculate(fallback, remainingRejectStatuses)),
      taskCount: this.taskCount(),
      remainingTaskCount: this.taskCount(remainingRejectStatuses),
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

class Task {
  title: string
  description?: string
  status: Status
  estimateNumber: number // e.g 7
  elapsedEstimate?: number // e.g 7
  estimateUnit: EstimateUnit // e.g. story points
  assignee?: Resource

  constructor(title: string, status: Status, estimateNumber: number, estimateUnit: EstimateUnit, assignee?: Resource, elapsedEstimate?: number, description?: string) {
    this.title = title
    this.status = status
    this.estimateNumber = estimateNumber
    this.estimateUnit = estimateUnit
    this.assignee = assignee
    this.elapsedEstimate = elapsedEstimate
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
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => {
        const total = this.estimateUnit === estimateUnit && !rejectStatuses.includes(this.status) ? this.estimateNumber : 0
        return [estimateUnit, total]
      })
      .fromPairs()
      .value()
  }

  taskCount(rejectStatuses: Status[]): number {
    return rejectStatuses.includes(this.status) ? 0 : 1
  }

  calculate(fallback: Resource): Object {
    return {
      ...this,
      assignedEstimatedWorkdays: this.assignedEstimatedWorkdays([]),
      unassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(fallback, []),
    }
  }
}

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

const upeDocs = new Task('UPE Docs', Status.NOT_STARTED, 2, EstimateUnit.DAYS, yaw, 10)
const connectDocs = new Task('Ungate `klarna_payments`', Status.NOT_STARTED, 2, EstimateUnit.DAYS, yaw)
const paymentIntentDocs = new Task('PI Docs', Status.IN_REVIEW, 2, EstimateUnit.DAYS, richard)
const finishTheDocs = new TaskNode('Complete docs', eoin, [upeDocs, connectDocs, paymentIntentDocs])

const checkoutDogfooding = new Task('Checkout Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.DAYS, richard)
const piDogfooding = new Task('Payment Intents Dogfooding', Status.DONE, 2, EstimateUnit.STORY_POINTS, richard)
const upeDogfooding = new Task('UPE Dogfooding', Status.NOT_STARTED, 2, EstimateUnit.STORY_POINTS)
const dogfooding = new TaskNode('Dogfooding', eoin, [checkoutDogfooding, piDogfooding, upeDogfooding])

const root = new TaskNode('Klarna GA', eoin, [finishTheDocs, dogfooding], 'Get Klarna to GA')

// Missing:

// What if you have a 'project' but you just want to ball park it '30 days'? Should we support this?
// Decision: Won't build.

// Putting dates on it:

// Prioritization
// Resource priotization
// Global ticket prioritization?
// Sub part of the tree?

// How to handle unassigned tasks?
// Fallback to average team (team is param? team is attached to node in tree?)

// Resource availability
// calendar?
// how many days off per month / 6 months / year???

// How to handle 'lead times' / parallelization?
// Solution: added 'elapsedEstimate' to tasks

// End date in params???

// Overall contingency?
// contingency on mid level nodes?

console.log(JSON.stringify(root.calculate(fallbackResource, [Status.DONE]), null, 2))
