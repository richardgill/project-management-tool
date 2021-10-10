import _ from 'lodash'
import React, { ComponentType } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import URI from 'urijs'

import { LandingPage } from '../pages/Landing'

export const routes: { path: string; component: ComponentType; props?: object }[] = [
  {
    path: '/',
    component: LandingPage,
  },
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
