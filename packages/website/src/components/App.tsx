import React from 'react'
import { QueryClientProvider, QueryClient } from 'react-query'
import Router from './Router'

const queryClient = new QueryClient()
export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  )
}
