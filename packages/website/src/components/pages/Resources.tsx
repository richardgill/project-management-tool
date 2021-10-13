import React from 'react'
import { classNames } from 'lib/classNames'
import { useFindResourceByIdQuery } from 'generated/graphql'
import { Shell } from 'components/core/Shell'

export const ResourcesPage = () => {
  const { status, data, error, isFetching } = useFindResourceByIdQuery({ resourceId: 'resourceIdq23' })
  return (
    <Shell>
      <div>{isFetching}</div>
      <div>{JSON.stringify(error)}</div>
      <div>{status}</div>
      <div>{JSON.stringify(data)}</div>
      <button type="button" className={classNames('bg-blue-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded bg-purple-500')}>
        Button
      </button>
    </Shell>
  )
}
