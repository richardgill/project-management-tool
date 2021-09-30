import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { importSchema } from 'graphql-import'
import { IResolvers } from '@graphql-tools/utils'
import { resolvers } from './resolvers'
import firebase from '../firebase'
import { Context } from './types'

const typeDefs = importSchema('./src/graphql/schema.graphql')

export const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers as IResolvers,
  context: async ({ req }): Promise<Context> => {
    const token: string = req.headers.authorization || ''
    try {
      const user = await firebase.auth().verifyIdToken(token)
      return { user, token }
    } catch {
      throw new AuthenticationError('you must be logged in')
    }
  },
})
