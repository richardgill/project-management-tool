import express from 'express'
import path from 'path'
import { server } from './graphql/server'
// eslint-disable-next-line import/newline-after-import
;(async () => {
  const app = express()
  await server.start()

  server.applyMiddleware({ app })

  app.use('/', express.static('website'))

  app.get('/*', (request, response) => response.sendFile(path.join(path.resolve(), '/website/index.html')))

  const port = process.env.PORT || 4000

  app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`))
})()
