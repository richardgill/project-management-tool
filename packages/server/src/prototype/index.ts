import { Resource, User, VelocityMappings, EstimateUnit, Status, Task, TaskNode, RiskEstimator, SpreadEstimator } from './model'
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

const upeDocs = new Task('UPE Docs', Status.NOT_STARTED, new SpreadEstimator(EstimateUnit.DAYS, 2, 3, 4), yaw, 10)
const connectDocs = new Task('Ungate `klarna_payments`', Status.NOT_STARTED, new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1), yaw)
const paymentIntentDocs = new Task('PI Docs', Status.IN_REVIEW, new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1), richard)
const finishTheDocs = new TaskNode('Complete docs', eoin, [upeDocs, connectDocs, paymentIntentDocs])

const checkoutDogfooding = new Task('Checkout Dogfooding', Status.NOT_STARTED, new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1), richard)
const piDogfooding = new Task('Payment Intents Dogfooding', Status.DONE, new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1), richard)
const upeDogfooding = new Task('UPE Dogfooding', Status.NOT_STARTED, new RiskEstimator(EstimateUnit.DAYS, 2, 1.2, 0.1))
const dogfooding = new TaskNode('Dogfooding', eoin, [checkoutDogfooding, piDogfooding, upeDogfooding])

const root = new TaskNode('Klarna GA', eoin, [finishTheDocs, dogfooding], 'Get Klarna to GA')

// Risk / Spread estimates / Task level contingency?
//    min est - mid est - max est
//
//    RISK
//      -> estimate variance factor -> e.g. est X 120%
//        -> MIN your estimate (or maybe EVF x 0.9)
//        -> MID your estimate (or maybe EVF x 1.0)
//        -> MAX your estimate (or maybe EVF x 1.1)
//    SPREAD
//      -> I GIVE RISK
//        -> MIN your estimate - User Provided
//        -> MID your estimate - User Provided (mid point between min/max)
//        -> MAX your estimate - User Provided

//      TIMEESTIMATOR : Risk (factor) / SPREAD (MIN, MAX)

// risk(20, 'DAYS', 0.1) -> 15, 20, 25 Spread
// risk(20, 'DAYS', minFactor: 0.9, maxFactor: 1.1) -> 10, 20, 25 Spread
// risk(20, 'DAYS', minFactor: 0.8, maxFactor: 1.1) -> 10, 20, 25 Spread
// spread(10, 20, 25)

// Simplify outputs
//      Node ( STATUS, CALCULATOR, ASSIGNEE)

// Missing:

// What if you have a 'project' but you just want to ball park it '30 days'? Should we support this?
// Decision: Won't build.

// Putting dates on it:

// Prioritization
// Resource prioritization
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
