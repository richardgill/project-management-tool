import React, { useContext, useEffect } from 'react'
import { UserContext } from '../Context'
import HowItWorks from './HowItWorks'

export default (props: any) => {
  const user = useContext(UserContext)
  useEffect(() => {
    console.log('user', user)
    if (user && !user?.isLoadingUserName && !user?.isAnonymous) {
      props.history.push('/my-recipes')
    }
  }, [user])

  return <HowItWorks history={props.history} />
}
