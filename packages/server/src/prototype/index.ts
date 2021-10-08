import _ from 'lodash'
import {
  Resource,
  User,
  VelocityMappings,
  EstimateUnit,
  Status,
  Task,
  TaskNode,
  RiskEstimator,
  SpreadEstimator,
  ScheduledTask,
  generateResourceTaskLists,
  SpreadScenario,
  SpreadResourceWithTasks,
} from './model'
import { businessDayRange } from './dates'
import { displayTree } from './displayTree'

// Users
const eoin = new User('enugent', 'Eoin')

// Resources
const yaw = new Resource('yaw', 'Yaw', businessDayRange())
const richard = new Resource('richard', 'Richard', businessDayRange())
const kaan = new Resource('kaan', 'Kaan', businessDayRange())

const velocityMappings = new VelocityMappings(
  {
    [richard.handle]: { [EstimateUnit.DAYS]: 0.8, [EstimateUnit.STORY_POINTS]: 2 },
    [yaw.handle]: { [EstimateUnit.DAYS]: 0.4, [EstimateUnit.STORY_POINTS]: 1 },
  },
  { [EstimateUnit.DAYS]: 0.5, [EstimateUnit.STORY_POINTS]: 1.2 },
  false,
)
// Tree

const upeDocs = new Task({
  title: 'UPE Docs',
  status: Status.NOT_STARTED,
  resourceEstimator: new SpreadEstimator(EstimateUnit.STORY_POINTS, 2, 3, 4),
  expectedDaysToCompletion: 10,
})
const connectDocs = new Task({
  title: 'Ungate `klarna_payments`',
  status: Status.NOT_STARTED,
  resourceEstimator: new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1),
  assignee: yaw,
  score: 20,
})
const paymentIntentDocs = new Task({
  title: 'PI Docs',
  status: Status.IN_REVIEW,
  resourceEstimator: new RiskEstimator(EstimateUnit.STORY_POINTS, 5, 1.2, 0.1),
  assignee: richard,
  score: 20,
})
const finishTheDocs = new TaskNode({ title: 'Complete docs', owner: eoin, children: [upeDocs, connectDocs, paymentIntentDocs] })

const checkoutDogfooding = new Task({
  title: 'Checkout Dogfooding',
  status: Status.NOT_STARTED,
  resourceEstimator: new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1),
  score: 10,
  assignee: kaan,
})
const piDogfooding = new Task({
  title: 'Payment Intents Dogfooding',
  status: Status.DONE,
  resourceEstimator: new RiskEstimator(EstimateUnit.STORY_POINTS, 2, 1.2, 0.1),
  score: 5,
  assignee: kaan,
})
const upeDogfooding = new Task({ title: 'UPE Dogfooding', status: Status.NOT_STARTED, resourceEstimator: new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1) })
const dogfooding = new TaskNode({ title: 'Dogfooding', owner: eoin, children: [checkoutDogfooding, piDogfooding, upeDogfooding] })

const root = new TaskNode({ title: 'Klarna GA', owner: eoin, children: [finishTheDocs, dogfooding], resources: [yaw, richard] })

const result = root.calculate({ velocityMappings, remainingRejectStatuses: [Status.DONE] })

displayTree(result)

// console.log(JSON.stringify(result, null, 2))
// console.log(JSON.stringify(velocityMappings, null, 2))

const taskLists = generateResourceTaskLists(root, { velocityMappings, remainingRejectStatuses: [Status.DONE] })

const printTaskList = (spreadResourceWithTasks: SpreadResourceWithTasks, scenario: SpreadScenario) => {
  console.log('\n\n')
  console.log(scenario)
  const taskList = spreadResourceWithTasks[scenario]
  _.map(taskList, r => {
    console.log('Resource:', r.resource.handle)
    _.map(r.tasks, (t: ScheduledTask) => {
      console.log('  ', t.task.title, t.startDate.format(), t.endDate.format(), 'expectedDaysToCompletion:', t.task.expectedDaysToCompletion)
      console.log('  ', t.task.resourceEstimatedWorkdays(velocityMappings, [Status.DONE], t.assignee())[scenario], 'days')
    })
  })
}
printTaskList(taskLists, 'min')
printTaskList(taskLists, 'mid')
printTaskList(taskLists, 'max')
