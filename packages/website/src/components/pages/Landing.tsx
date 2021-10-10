import React from 'react'
import { useFindResourceByIdQuery } from '../../generated/graphql'

export const LandingPage = () => {
  const { status, data, error, isFetching } = useFindResourceByIdQuery({ resourceId: 'resourceIdq23' })
  return (
    <>
      <div>{isFetching}</div>
      <div>{JSON.stringify(error)}</div>
      <div>{status}</div>
      <div>{JSON.stringify(data)}</div>
    </>
  )
}
