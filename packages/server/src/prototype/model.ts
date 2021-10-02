/* eslint-disable max-classes-per-file */

import { number } from '@hapi/joi'
import _ from 'lodash'

type VelocityMap = { [key in EstimateUnit]: number }
type ModelParams = {
  remainingRejectStatuses: Status[]
  velocityMappings: VelocityMappings
}

export function convertEstimatesToWorkdays(estimates: SpreadEstimate, velocityMap: VelocityMap): SpreadEstimate {
  const divisor = velocityMap[estimates.estimateUnit]
  return  {
    min: estimates.min / divisor,
    mid: estimates.mid / divisor,
    max: estimates.max / divisor,
    estimateUnit: EstimateUnit.DAYS
  }
}

export function sumSpreadEstimates(spreadEstimates: SpreadEstimate[]): SpreadEstimate {
  if(!spreadEstimates.every( (val) => val.estimateUnit === spreadEstimates[0].estimateUnit )) {
    console.log(spreadEstimates)
    throw 'SpreadEstimates must have same units'
  }
  if(_.isEmpty(spreadEstimates)) {
    throw 'Cannot sum if there are no spread estimates!'
  }
  // Should only allow same units for all spread estimates
  return {
    min: _.chain(spreadEstimates).map(e => e.min).sum().value(),
    mid: _.chain(spreadEstimates).map(e => e.mid).sum().value(),
    max: _.chain(spreadEstimates).map(e => e.max).sum().value(),
    estimateUnit: _.first(spreadEstimates)?.estimateUnit || EstimateUnit.DAYS
  }
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

  sumOfEstimates(rejectStatuses: Status[]): { [key: string]: SpreadEstimate } {
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => [
        estimateUnit,
        sumSpreadEstimates(this.children.map(n => n.sumOfEstimates(rejectStatuses)[estimateUnit]))
      ])
      .fromPairs()
      .value()
  }

  assignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates(this.children.map(n => n.assignedEstimatedWorkdays(velocityMappings, rejectStatuses)))
  }

  unassignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates(this.children.map(n => n.unassignedEstimatedWorkdays(velocityMappings, rejectStatuses)))
  }

  totalEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates([this.assignedEstimatedWorkdays(velocityMappings, rejectStatuses), this.unassignedEstimatedWorkdays(velocityMappings, rejectStatuses)])
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
  elapsedEstimate?: number // e.g 7
  estimator: IEstimator
  assignee?: Resource

  constructor(title: string, status: Status, estimator: IEstimator, assignee?: Resource, elapsedEstimate?: number, description?: string) {
    this.title = title
    this.status = status
    this.estimator = estimator
    this.assignee = assignee
    this.elapsedEstimate = elapsedEstimate
    this.description = description
  }

  zeroEstimates(): SpreadEstimate {
    return { min: 0, mid: 0, max: 0, estimateUnit: this.estimator.estimateUnit}
  }

  estimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    if (rejectStatuses.includes(this.status)) {
      return this.zeroEstimates()
    }
    return convertEstimatesToWorkdays(this.estimator.calculateSpread(), velocityMappings.getVelocityMap(this.assignee))
  }

  assignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return this.assignee ? this.estimatedWorkdays(velocityMappings, rejectStatuses) : this.zeroEstimates()
  }

  unassignedEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]):SpreadEstimate {
    return this.assignee ? this.zeroEstimates() : this.estimatedWorkdays(velocityMappings, rejectStatuses)
  }

  sumOfEstimates(rejectStatuses: Status[]): { [key: string]: SpreadEstimate } {
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => {
        const total = this.estimator.estimateUnit === estimateUnit && !rejectStatuses.includes(this.status) ? this.estimator.calculateSpread() : {min: 0, mid: 0, max: 0, estimateUnit: estimateUnit}
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

type SpreadEstimate = {
  min: number,
  mid: number,
  max: number,
  estimateUnit: EstimateUnit
}

interface IEstimator {
  estimateUnit: EstimateUnit
  calculateSpread: () => SpreadEstimate
}

export class RiskEstimator implements IEstimator {
  estimateUnit: EstimateUnit
  estimateNumber: number
  riskFactor: number
  riskFactorSpread: number

  constructor(estimateUnit: EstimateUnit, estimateNumber: number, riskFactor: number, riskFactorSpread: number = 0.1){
    this.estimateUnit = estimateUnit
    this.estimateNumber = estimateNumber
    this.riskFactor = riskFactor
    this.riskFactorSpread = riskFactorSpread
  }

  calculateSpread(): SpreadEstimate {
    return {
      min: this.estimateNumber * this.riskFactor * (1 - this.riskFactorSpread),
      mid: this.estimateNumber * this.riskFactor,
      max: this.estimateNumber * this.riskFactor * (1 + this.riskFactorSpread),
      estimateUnit: this.estimateUnit
    }
  }
}


export class SpreadEstimator implements IEstimator {
  estimateUnit: EstimateUnit
  minEstimate: number
  midEstimate: number
  maxEstimate: number

  constructor(estimateUnit: EstimateUnit, minEstimate: number, midEstimate: number, maxEstimate: number){
    this.estimateUnit = estimateUnit
    this.minEstimate = minEstimate
    this.midEstimate = midEstimate
    this.maxEstimate = maxEstimate
  }

  calculateSpread(): SpreadEstimate {
    return {
      min: this.minEstimate,
      mid: this.midEstimate,
      max: this.maxEstimate,
      estimateUnit: this.estimateUnit
    }
  }
}

