import { Resolvers } from '../generated/graphql'

export const resolvers: Resolvers = {
  Query: {
    resource: (_, { resourceId }) => {
      console.log(resourceId)
      return { resourceId: 'hello', handle: 'hello' }
    },
  },
  Mutation: {
    createResource: resourceUpdate => {
      console.log('createResource', resourceUpdate)
      return { resourceId: 'hello', handle: 'hello' }
    },
  },
}
