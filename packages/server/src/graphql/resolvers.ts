import { Resolvers } from '../generated/graphql'

export const resolvers: Resolvers = {
  Query: {
    resource: (x, y) => {
      console.log(x, y.resourceId)
      return { resourceId: 'hello', handle: 'hello' }
    },
  },
  Mutation: {
    createResource: (_, resourceUpdate) => {
      console.log('createResource', resourceUpdate)
      return { resourceId: 'hello', handle: 'hello' }
    },
  },
}
