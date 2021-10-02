import { Resource, User, VelocityMappings, EstimateUnit, Status, Task, TaskNode } from './model'
import { displayTree } from './displayTree'

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

const result = root.calculate({ velocityMappings, remainingRejectStatuses: [Status.DONE] })
console.log(JSON.stringify(result, null, 2))

displayTree(result)
