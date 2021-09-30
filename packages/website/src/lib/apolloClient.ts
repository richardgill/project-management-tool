import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getCurrentUserOrSignInAnonymously } from './firebase'

const authLink = setContext(async (_, { headers }) => {
  const user = await getCurrentUserOrSignInAnonymously()
  const token = await user?.getIdToken(true)
  return {
    headers: {
      ...headers,
      authorization: token || ''
    }
  }
})

const link = createHttpLink({
  uri: `${process.env.REACT_APP_GRAPHQL_URL}/graphql`
})

export default new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(link)
})
