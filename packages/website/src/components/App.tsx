import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles'
import { ThemeProvider } from 'styled-components'
import Router from './Router'
import apolloClient from '../lib/apolloClient'
import { theme } from '../styles/theme'
import Context from './Context'

export default () => {
  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <ApolloProvider client={apolloClient}>
          <Context>
            <Router />
          </Context>
        </ApolloProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  )
}
