**DONE** Risk / Spread estimates / Task level contingency?
   min est - mid est - max est
   RISK
     -> estimate variance factor -> e.g. est X 120%
       -> MIN your estimate (or maybe EVF x 0.9)
       -> MID your estimate (or maybe EVF x 1.0)
       -> MAX your estimate (or maybe EVF x 1.1)
   SPREAD
     -> I GIVE RISK
       -> MIN your estimate - User Provided
       -> MID your estimate - User Provided (mid point between min/max)
       -> MAX your estimate - User Provided

     TIMEESTIMATOR : Risk (factor) / SPREAD (MIN, MAX)

risk(20, 'DAYS', 0.1) -> 15, 20, 25 Spread
risk(20, 'DAYS', minFactor: 0.9, maxFactor: 1.1) -> 10, 20, 25 Spread
risk(20, 'DAYS', minFactor: 0.8, maxFactor: 1.1) -> 10, 20, 25 Spread
spread(10, 20, 25)

Simplify outputs
     Node ( STATUS, CALCULATOR, ASSIGNEE)

Missing:

What if you have a 'project' but you just want to ball park it '30 days'? Should we support this?
**DONE** Decision: Won't build.

Putting dates on it:

Prioritization
Resource prioritization - this won't work because of unassigned tasks
Global task prioritization?
Sub part of the tree?
                        X
           (100)                  (1)                (0)
         (10 20 30 40 1)       (80 10 10 11)    (10 1 1 1 1 1 1)
           2  4  6               40  5  5
                        X
           (25)                  (50)
         (x  x  x)             (80 x x)
          25 25 25             80 50 50

       Klarna GA           $200M
         - Ship Payments     150
           - payment intents   50 - DONE
           - checkout          50 - DONE
           - connect           50
         - upe               50
       Country Expansion   $75M
         - France            20 - STARTING
         - Maldova           5
         - Lituatnia         5
         - small country     5

How to handle unassigned tasks?
No? Fallback to average team (team is param? team is attached to node in tree?)
Randomly assign?
Split into assigned and unassigned? This might not work?

Current decision: Assign from resources (infer from parent nodes) (algorithm to pick resource if unassigned: find first available resource (no other work))

   TaskTree -
             |
          Scheduler   <-   ResourceAvailability
             |
           For Highest priority subnode in the entire tree... SCHEDULE
           For next highest priority subnode in the entire tree... SCHEDULE
           ... repeat...
   * You should be able to provide to this, that some tasks already are scheduled! (or being being worked on) / assigned
   ! How do you gaurd against too many things being 'manually' assigned to someone? Stretch delivery date? HOW?
     Start will not be user configurable...? ** This might not work.... ** because if someone tells you that things are in "STARTED" state, what do you do?

Resource availability
calendar?
how many days off per month / 6 months / year???
How many days off / availability of the fallback / average?
Work days vs calendar days.

Current decision: Each resource has the dates they are 'working' e.g. 2021-01-01, 2021-01-02

Start date in params??
End date in params???

Overall contingency?
contingency on mid level nodes?

How to handle 'lead times' / parallelization?
**DONE** Solution: added 'elapsedEstimate' to tasks