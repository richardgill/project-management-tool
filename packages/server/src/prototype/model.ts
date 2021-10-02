/* eslint-disable max-classes-per-file */

import _ from 'lodash'

type VelocityMap = { [key in EstimateUnit]: number }
type ModelParams = {
  remainingRejectStatuses: Status[]
  velocityMappings: VelocityMappings
}

export class VelocityMappings {
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

export enum Status {
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum EstimateUnit {
  DAYS = 'DAYS',
  // HOURS,
  STORY_POINTS = 'STORY_POINTS',
}

export class User {
  handle: string
  name: string

  constructor(handle: string, name: string) {
    this.handle = handle
    this.name = name
  }
}

export class Resource {
  handle: string
  name: string
  // calendar:

  constructor(handle: string, name: string) {
    this.handle = name
    this.name = name
  }
}

export class TaskNode {
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

export class Task {
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
