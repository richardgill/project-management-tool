/* eslint-disable max-classes-per-file */

import _ from 'lodash'
import dayjs from 'dayjs'

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

type VelocityMap = { [key in EstimateUnit]: number }

type ModelParams = {
  remainingRejectStatuses: Status[]
  velocityMappings: VelocityMappings
}

const convertEstimatesToWorkdays = (estimates: SpreadEstimate, velocityMap: VelocityMap): SpreadEstimate => {
  const divisor = velocityMap[estimates.estimateUnit]
  return {
    min: estimates.min / divisor,
    mid: estimates.mid / divisor,
    max: estimates.max / divisor,
    estimateUnit: EstimateUnit.DAYS,
  }
}

const sumSpreadEstimates = (spreadEstimates: SpreadEstimate[]): SpreadEstimate => {
  if (!spreadEstimates.every(val => val.estimateUnit === spreadEstimates[0].estimateUnit)) {
    console.log(spreadEstimates)
    throw new Error('SpreadEstimates must have same units')
  }
  if (spreadEstimates.length === 0) {
    throw new Error('Cannot sum if there are no spread estimates!')
  }
  // Should only allow same units for all spread estimates
  return {
    min: _.chain(spreadEstimates)
      .map(e => e.min)
      .sum()
      .value(),
    mid: _.chain(spreadEstimates)
      .map(e => e.mid)
      .sum()
      .value(),
    max: _.chain(spreadEstimates)
      .map(e => e.max)
      .sum()
      .value(),
    estimateUnit: spreadEstimates[0].estimateUnit,
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
  children: (TaskNode | Task)[]
  owner: User
  resources?: Resource[]
  description?: string
  parent?: TaskNode

  constructor({ title, owner, children, resources, description }: { title: string; owner: User; children: (TaskNode | Task)[]; resources?: Resource[]; description?: string }) {
    this.title = title
    this.children = children
    this.owner = owner
    this.resources = resources
    this.description = description
    for (const child of this.children) {
      child.setParent(this)
    }
  }

  setParent(parent: TaskNode) {
    this.parent = parent
  }

  sumOfEstimates(rejectStatuses: Status[]): { [key: string]: SpreadEstimate } {
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => [estimateUnit, sumSpreadEstimates(this.children.map(n => n.sumOfEstimates(rejectStatuses)[estimateUnit]))])
      .fromPairs()
      .value()
  }

  assignedResourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates(this.children.map(n => n.assignedResourceEstimatedWorkdays(velocityMappings, rejectStatuses)))
  }

  unassignedResourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates(this.children.map(n => n.unassignedResourceEstimatedWorkdays(velocityMappings, rejectStatuses)))
  }

  totalResourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return sumSpreadEstimates([
      this.assignedResourceEstimatedWorkdays(velocityMappings, rejectStatuses),
      this.unassignedResourceEstimatedWorkdays(velocityMappings, rejectStatuses),
    ])
  }

  taskCount(rejectStatuses: Status[] = []): number {
    return _.chain(this.children)
      .map(n => n.taskCount(rejectStatuses))
      .sum()
      .value()
  }

  flattenedTasks(): Task[] {
    return this.children.flatMap(c => {
      if (c instanceof Task) {
        return [c]
      }
      return c.flattenedTasks()
    })
  }

  tasksTodoInPriorityOrder(): Task[] {
    const tasksTodo = this.flattenedTasks().filter(t => t.status != Status.DONE)
    const startedTasks = tasksTodo.filter(t => t.status != Status.NOT_STARTED)
    const unstartedTasks = tasksTodo.filter(t => t.status === Status.NOT_STARTED)
    return [
      ...startedTasks,
      ..._.chain(unstartedTasks)
        .filter(t => !_.isNil(t.score))
        .orderBy(t => t.score, 'desc')
        .value(),
      ..._.chain(unstartedTasks)
        .filter(t => _.isNil(t.score))
        .orderBy(t => t.created, 'asc')
        .value(),
    ]
  }

  getResources(): Resource[] | null | undefined {
    return this.resources || this.parent?.getResources()
  }

  calculate({ velocityMappings, remainingRejectStatuses }: ModelParams): Object {
    return {
      ..._.omit(this, 'parent'),
      children: this.children.map(c => c.calculate({ velocityMappings, remainingRejectStatuses })),
      taskCount: this.taskCount(),
      remainingTaskCount: this.taskCount(remainingRejectStatuses),
      sumOfEstimates: this.sumOfEstimates([]),
      remainingSumOfEstimates: this.sumOfEstimates(remainingRejectStatuses),
      assignedResourceEstimatedWorkdays: this.assignedResourceEstimatedWorkdays(velocityMappings, []),
      unassignedResourceEstimatedWorkdays: this.unassignedResourceEstimatedWorkdays(velocityMappings, []),
      totalResourceEstimatedWorkdays: this.totalResourceEstimatedWorkdays(velocityMappings, []),
      remainingAssignedResourceEstimatedWorkdays: this.assignedResourceEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
      remainingUnassignedResourceEstimatedWorkdays: this.unassignedResourceEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
      remainingTotalResourceEstimatedWorkdays: this.totalResourceEstimatedWorkdays(velocityMappings, remainingRejectStatuses),
    }
  }
}

const ZERO_DAYS_ESTIMATE = { min: 0, mid: 0, max: 0, estimateUnit: EstimateUnit.DAYS }

export class Task {
  title: string
  description?: string
  status: Status
  expectedDaysToCompletion?: number
  resourceEstimator: IEstimator
  assignee?: Resource
  created: dayjs.Dayjs
  score?: number
  parent?: TaskNode

  constructor({
    title,
    status,
    resourceEstimator,
    assignee,
    expectedDaysToCompletion,
    description,
    created,
    score,
  }: {
    title: string
    status: Status
    resourceEstimator: IEstimator
    assignee?: Resource
    expectedDaysToCompletion?: number
    description?: string
    created?: dayjs.Dayjs
    score?: number
  }) {
    this.title = title
    this.status = status
    this.resourceEstimator = resourceEstimator
    this.assignee = assignee
    this.expectedDaysToCompletion = expectedDaysToCompletion
    this.description = description
    this.created = created || dayjs()
    this.score = score
  }

  setParent(parent: TaskNode) {
    this.parent = parent
  }

  resourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[], assignee?: Resource): SpreadEstimate {
    if (rejectStatuses.includes(this.status)) {
      return ZERO_DAYS_ESTIMATE
    }
    return convertEstimatesToWorkdays(this.resourceEstimator.calculateSpread(), velocityMappings.getVelocityMap(assignee))
  }

  assignedResourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return this.assignee ? this.resourceEstimatedWorkdays(velocityMappings, rejectStatuses, this.assignee) : ZERO_DAYS_ESTIMATE
  }

  unassignedResourceEstimatedWorkdays(velocityMappings: VelocityMappings, rejectStatuses: Status[]): SpreadEstimate {
    return this.assignee ? ZERO_DAYS_ESTIMATE : this.resourceEstimatedWorkdays(velocityMappings, rejectStatuses)
  }

  sumOfEstimates(rejectStatuses: Status[]): { [key: string]: SpreadEstimate } {
    return _.chain(Object.keys(EstimateUnit))
      .map(estimateUnit => {
        const total =
          this.resourceEstimator.estimateUnit === estimateUnit && !rejectStatuses.includes(this.status)
            ? this.resourceEstimator.calculateSpread()
            : { min: 0, mid: 0, max: 0, estimateUnit }
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
      ..._.omit(this, 'parent'),
      assignedResourceEstimatedWorkdays: this.assignedResourceEstimatedWorkdays(velocityMappings, []),
      unassignedResourceEstimatedWorkdays: this.unassignedResourceEstimatedWorkdays(velocityMappings, []),
      spread: this.resourceEstimator.calculateSpread(),
    }
  }

  getResources(): Resource[] {
    return this.parent?.getResources() || []
  }
}

type SpreadEstimate = {
  min: number
  mid: number
  max: number
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

  constructor(estimateUnit: EstimateUnit, estimateNumber: number, riskFactor: number, riskFactorSpread: number = 0.1) {
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
      estimateUnit: this.estimateUnit,
    }
  }
}

export class SpreadEstimator implements IEstimator {
  estimateUnit: EstimateUnit
  minEstimate: number
  midEstimate: number
  maxEstimate: number

  constructor(estimateUnit: EstimateUnit, minEstimate: number, midEstimate: number, maxEstimate: number) {
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
      estimateUnit: this.estimateUnit,
    }
  }
}

class ScheduledTask {
  startDate: dayjs.Dayjs
  endDate: dayjs.Dayjs
  task: Task

  constructor(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, task: Task) {
    this.startDate = startDate
    this.endDate = endDate
    this.task = task
  }
}

type ResourceTaskList = {
  resource: Resource
  tasks: ScheduledTask[]
}[]

export const generateResourceTaskList = (
  root: TaskNode,
  resources: Resource[],
  scenario: 'min' | 'mid' | 'max',
  { velocityMappings, remainingRejectStatuses = [Status.DONE] }: ModelParams,
) => {
  const resourceTaskList: ResourceTaskList = resources.map(r => {
    return { resource: r, tasks: [] }
  })
  const taskList = root.tasksTodoInPriorityOrder()
  for (const task of taskList) {
    // handle started tasks
    if (task.status !== Status.NOT_STARTED) {
      if (!task.assignee) {
        throw 'STARTED tasks must have an assignee'
      }
    }

    // This should become smarted and pick an assignee based on availability
    const assignee = task.assignee || _.sample(resources)
    const spread = task.resourceEstimatedWorkdays(velocityMappings, remainingRejectStatuses, assignee)
    const currentTasks = _.find(resourceTaskList, { resource: task.assignee })?.tasks
    const nextStartDate = _.get(_.last(currentTasks), 'endDate', dayjs())
    const scheduledTask = new ScheduledTask(nextStartDate.add(1, 'days'), nextStartDate.add(Math.ceil(spread[scenario]), 'days'), task)
    currentTasks?.push(scheduledTask)
  }
  return resourceTaskList
}
