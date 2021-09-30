import React, { useContext, useEffect, ComponentType } from 'react'
import { UserContext } from '../Context'

export const ensureUserNameSet = (Component: ComponentType) => (props: any) => {
  const user = useContext(UserContext)
  useEffect(() => {
    if (user && !user.isLoadingUserName && !user.isAnonymous && !user.userName) {
      props.history.push(`/setupUserName?redirect=${props.history.location.pathname}`)
    }
  }, [user])

  return <Component {...props} />
}
