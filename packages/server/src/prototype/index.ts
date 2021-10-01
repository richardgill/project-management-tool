/* eslint-disable max-classes-per-file */

import _ from 'lodash'

type VelocityMap = { [key in EstimateUnit]: number }
type ModelParams = {
  remainingRejectStatuses: Status[]
  velocityMappings: VelocityMappings
}

class VelocityMappings {
  resourceVelocityMap: { [key: string]: VelocityMap }
  fallbackVelocityMap: VelocityMap
  fallbackToAverage: boolean

  constructor(resourceVelocityMap: { [key: string]: VelocityMap }, fallbackVelocityMap: VelocityMap, fallbackToAverage: boolean = false) {
    this.resourceVelocityMap = resourceVelocityMap
    this.fallbackVelocityMap = fallbackVelocityMap
    this.fallbackToAverage = fallbackToAverage
  }

  getVelocityMap(resource: Resource | undefined): VelocityMap {
    return resource ? this.resourceVelocityMap[resource.handle] || this.getFallbackVelocityMap() : this.getFallbackVelocityMap()
  }

  getAverageVelocityMap(): VelocityMap {
    const velocityMaps = _.values(this.resourceVelocityMap)
    return _.mergeWith({}, ...velocityMaps, (a: number, b: number) => {
      return b / velocityMaps.length + a
    })
  }

  getFallbackVelocityMap(): VelocityMap {
    return this.fallbackToAverage ? this.getAverageVelocityMap() : this.fallbackVelocityMap
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

class User {
  handle: string
  name: string

  constructor(handle: string, name: string) {
    this.handle = handle
    this.name = name
  }
}

class Resource {
  handle: string
  name: string
  // calendar:

  constructor(handle: string, name: string) {
    this.handle = name
    this.name = name
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

  assignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): number {
    return _.chain(this.children)
      .map(n => n.assignedEstimatedWorkdays(velocityMappings, rejectStatuses))
      .sum()
      .value()
  }

  unassignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): number {
    return _.chain(this.children)
      .map(n => n.unassignedEstimatedWorkdays(velocityMappings, rejectStatuses))
      .sum()
      .value()
  }

  totalEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): number {
    return this.assignedEstimatedWorkdays(velocityMappings, rejectStatuses) + this.unassignedEstimatedWorkdays(velocityMappings, rejectStatuses)
  }

  taskCount(rejectStatuses: Status[] = []): number {
    return _.chain(this.children)
      .map(n => n.taskCount(rejectStatuses))
      .sum()
      .value()
  }

  calculate({ velocityMappings, remainingRejectStatuses }: ModelParams): Object {
    return {
      ...this,
      children: this.children.map(c => c.calculate({ velocityMappings, remainingRejectStatuses })),
      taskCount: this.taskCount(),
      remainingTaskCount: this.taskCount(remainingRejectStatuses),
      sumOfEstimates: this.sumOfEstimates([]),
      remainingSumOfEstimates: this.sumOfEstimates(remainingRejectStatuses),
      assignedEstimatedWorkdays: this.assignedEstimatedWorkdays(velocityMappings, []),
      unassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(velocityMappings, []),
      totalEstimatedWorkdays: this.totalEstimatedWorkdays(velocityMappings, []),
      remainingAssignedEstimatedWorkdays: this.assignedEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
      remainingUnassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
      remainingTotalEstimatedWorkdays: this.totalEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
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

  estimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]) {
    if (rejectStatuses.includes(this.status)) {
      return 0
    }
    return this.estimateNumber / velocityMappings.getVelocityMap(this.assignee)[this.estimateUnit]
  }

  assignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]) {
    return this.assignee ? this.estimatedWorkdays(velocityMappings, rejectStatuses) : 0
  }

  unassignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]) {
    return this.assignee ? 0 : this.estimatedWorkdays(velocityMappings, rejectStatuses)
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

  calculate({ velocityMappings }: ModelParams): Object {
    return {
      ...this,
      assignedEstimatedWorkdays: this.assignedEstimatedWorkdays(velocityMappings, []),
      unassignedEstimatedWorkdays: this.unassignedEstimatedWorkdays(velocityMappings, []),
    }
  }
}

console.log('starting prototype')
// Users
const eoin = new User('enugent', 'Eoin')

// Resources
const yaw = new Resource('yaw', 'Yaw')
const richard = new Resource('richard', 'Richard')

const velocityMappings = new VelocityMappings(
  {
    [richard.handle]: { [EstimateUnit.DAYS]: 0.8, [EstimateUnit.STORY_POINTS]: 2 },
    [yaw.handle]: { [EstimateUnit.DAYS]: 0.4, [EstimateUnit.STORY_POINTS]: 1 },
  },
  { [EstimateUnit.DAYS]: 0.5, [EstimateUnit.STORY_POINTS]: 1.2 },
  false,
)
// const overrideVelocityMappings = new VelocityMappings({}, { [EstimateUnit.DAYS]: 0.2, [EstimateUnit.STORY_POINTS]: 0.8 }, false)

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

// Spread estimates?

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
// How many days off / availability of the fallback / average?

// How to handle 'lead times' / parallelization?
// Solution: added 'elapsedEstimate' to tasks

// End date in params???

// Overall contingency?
// contingency on mid level nodes?

console.log(JSON.stringify(root.calculate({ velocityMappings, remainingRejectStatuses: [Status.DONE] }), null, 2))
