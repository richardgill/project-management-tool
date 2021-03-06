import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import path from 'path'
import cors from 'cors'
import { schemaWithResolvers } from './graphql/server'
// eslint-disable-next-line import/newline-after-import
;(async () => {
  const app = express()
  if (process.env.ENABLE_CORS === 'true') {
    console.log('Enabled cors')
    app.use(cors())
  }
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schemaWithResolvers,
      graphiql: true,
    }),
  )

  app.use('/', express.static('website'))

  app.get('/*', (request, response) => response.sendFile(path.join(path.resolve(), '/website/index.html')))

  const port = process.env.PORT || 4000

  app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}/graphql`))
})()
