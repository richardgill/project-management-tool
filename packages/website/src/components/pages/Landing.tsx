import React from 'react'
import { tailwindOverrideClasses } from 'lib/tailwindOverride'
import { useFindResourceByIdQuery } from 'generated/graphql'

export const LandingPage = () => {
  const { status, data, error, isFetching } = useFindResourceByIdQuery({ resourceId: 'resourceIdq23' })
  return (
    <>
      <div>{isFetching}</div>
      <div>{JSON.stringify(error)}</div>
      <div>{status}</div>
      <div>{JSON.stringify(data)}</div>
      <button type="button" className={tailwindOverrideClasses('bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded bg-pink-500')}>
        Button
      </button>
    </>
  )
}
