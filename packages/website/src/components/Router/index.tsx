import _ from 'lodash'
import React, { ComponentType } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import URI from 'urijs'
import Recipe from '../pages/Recipe'
import Recipes from '../pages/Recipes'
import NewRecipe from '../pages/NewRecipe'
import EditRecipe from '../pages/EditRecipe'
import SignUp from '../pages/SignUp'
import SetupUserName from '../pages/SetupUserName'
import Examples from '../pages/HowItWorks'
import { ensureUserNameSet } from './EnsureUserNameSet'
import Feedback from '../pages/Feedback'
import Landing from '../pages/Landing'

export const routes: { path: string; component: ComponentType; props?: object }[] = [
  {
    path: '/recipes/:userId/:recipeId/edit',
    component: ensureUserNameSet(EditRecipe)
  },
  {
    path: '/recipes/:userName/:recipeSlug',
    component: ensureUserNameSet(Recipe)
  },
  {
    path: '/recipes/:userName',
    component: ensureUserNameSet(Recipes)
  },
  {
    path: '/my-recipes',
    component: ensureUserNameSet(Recipes)
  },
  {
    path: '/recipe/new',
    component: ensureUserNameSet(NewRecipe)
  },
  {
    path: '/signup',
    component: SignUp
  },
  {
    path: '/setupUserName',
    component: SetupUserName
  },
  {
    path: '/how-it-works',
    component: Examples
  },
  {
    path: '/feedback',
    component: Feedback
  },
  {
    path: '/',
    component: Landing
  }
]

export default () => {
  return (
    <Router>
      <Switch>
        {_.map(routes, route => {
          return (
            <Route
              key={route.path}
              path={route.path}
              render={routerProps => {
                const queryParams = URI()
                  .query(routerProps.history.location.search)
                  .query(true)
                const Component: any = route.component
                const props = { ...route.props, ...routerProps, queryParams }
                return <Component {...props} />
              }}
            />
          )
        })}
      </Switch>
    </Router>
  )
}
