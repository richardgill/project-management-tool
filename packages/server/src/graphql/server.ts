import { buildSchema } from 'graphql'
import fs from 'fs'

export const schema = buildSchema(fs.readFileSync('./src/graphql/schema.graphql').toString())
