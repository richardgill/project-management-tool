import { buildSchema } from 'graphql'
import { addResolversToSchema } from '@graphql-tools/schema'
import fs from 'fs'
import { resolvers } from './resolvers'

const schema = buildSchema(fs.readFileSync('./src/graphql/schema.graphql').toString())

export const schemaWithResolvers = addResolversToSchema(schema, resolvers)
