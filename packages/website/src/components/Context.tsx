import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { User } from 'firebase'
import firebase from '../lib/firebase'
import { CURRENT_USER } from '../lib/graphqlQueries'
import { CurrentUserQuery } from '../generated/graphql'

type UserContextValue = { userName?: string | null; uid: string; isAnonymous: boolean; isLoadingUserName: boolean } | null

export const UserContext = React.createContext<UserContextValue>(null)

type ChildrenPropType = { children: React.ReactNode }

const UserContextLoader = (props: ChildrenPropType) => {
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | undefined | null>(undefined)
  const { loading, data, refetch } = useQuery<CurrentUserQuery>(CURRENT_USER, { skip: !firebaseAuthUser })

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      setFirebaseAuthUser(user)
      refetch()
    })
  }, [])
  const user = firebaseAuthUser
    ? { userName: data?.user?.userName, uid: firebaseAuthUser.uid, isAnonymous: firebaseAuthUser.isAnonymous, isLoadingUserName: loading }
    : null
  return <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
}

export default (props: ChildrenPropType) => <UserContextLoader>{props.children}</UserContextLoader>
