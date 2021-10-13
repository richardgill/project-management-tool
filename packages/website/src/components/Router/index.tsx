import React, { ComponentType } from 'react'
import _ from 'lodash'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import URI from 'urijs'

import { TreePage } from 'components/pages/Tree'
import { ResourcesPage } from 'components/pages/Resources'
import { SettingsPage } from 'components/pages/Settings'

export const routes: { path: string; component: ComponentType; props?: object }[] = [
  {
    path: '/settings',
    component: SettingsPage,
  },
  {
    path: '/resources',
    component: ResourcesPage,
  },
  {
    path: '/tree',
    component: TreePage,
  },
  {
    path: '/',
    component: () => <Redirect to="/tree" />,
  },
]

export default () => {
  return (
    <Router>
      <Switch>
        {routes.map(route => {
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
