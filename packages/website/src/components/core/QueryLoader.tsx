import React from 'react'
import { QueryResult } from '@apollo/client'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Typography } from '@material-ui/core'
import { FlexBox } from './Box'

type ErrorComponentProps = { error: Error }

type Props<TData> = {
  queryResult: QueryResult<TData, unknown>
  children: (data: TData) => JSX.Element
  loadingComponent?: () => JSX.Element
  errorComponent?: (props: ErrorComponentProps) => JSX.Element
}

const DefaultLoadingIndicator = () => (
  <FlexBox flex={1} alignItems="center" justifyContent="center">
    <CircularProgress />
  </FlexBox>
)

const DefaultErrorComponent = ({ error }: ErrorComponentProps) => {
  return (
    <Typography variant="body1" color="error">
      {`Error :( ${error.message}`}
    </Typography>
  )
}

export default <TData extends unknown>({
  queryResult,
  children,
  loadingComponent = DefaultLoadingIndicator,
  errorComponent = DefaultErrorComponent
}: Props<TData>) => {
  if (queryResult.loading) {
    const LoadingComponent = loadingComponent
    return <LoadingComponent />
  }
  if (queryResult.error) {
    console.error(queryResult.error)
    const ErrorComponent = errorComponent
    return <ErrorComponent error={queryResult.error} />
  }

  if (!queryResult.data) {
    return <p>No data</p>
  }
  return children(queryResult.data)
}
