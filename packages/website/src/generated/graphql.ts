import { useQuery, UseQueryOptions } from 'react-query'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }

function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(process.env.REACT_APP_GRAPHQL_URL as string, {
      method: 'POST',
      ...{
        headers: {
          'Content-Type': 'application/json',
        },
      },
      body: JSON.stringify({ query, variables }),
    })

    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0]

      throw new Error(message)
    }

    return json.data
  }
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type Mutation = {
  __typename?: 'Mutation'
  createResource: Resource
}

export type MutationCreateResourceArgs = {
  resource: ResourceUpdate
  userId?: Maybe<Scalars['String']>
}

export type Query = {
  __typename?: 'Query'
  resource: Resource
}

export type QueryResourceArgs = {
  resourceId: Scalars['String']
}

export type Resource = {
  __typename?: 'Resource'
  handle: Scalars['String']
  resourceId: Scalars['String']
}

export type ResourceUpdate = {
  handle: Scalars['String']
}

export type ResourceFragment = { __typename?: 'Resource'; resourceId: string; handle: string }

export type FindResourceByIdQueryVariables = Exact<{
  resourceId: Scalars['String']
}>

export type FindResourceByIdQuery = { __typename?: 'Query'; resource: { __typename?: 'Resource'; resourceId: string; handle: string } }

export const ResourceFragmentDoc = `
    fragment Resource on Resource {
  resourceId
  handle
}
    `
export const FindResourceByIdDocument = `
    query FindResourceById($resourceId: String!) {
  resource(resourceId: $resourceId) {
    ...Resource
  }
}
    ${ResourceFragmentDoc}`
export const useFindResourceByIdQuery = <TData = FindResourceByIdQuery, TError = unknown>(
  variables: FindResourceByIdQueryVariables,
  options?: UseQueryOptions<FindResourceByIdQuery, TError, TData>,
) =>
  useQuery<FindResourceByIdQuery, TError, TData>(
    ['FindResourceById', variables],
    fetcher<FindResourceByIdQuery, FindResourceByIdQueryVariables>(FindResourceByIdDocument, variables),
    options,
  )
