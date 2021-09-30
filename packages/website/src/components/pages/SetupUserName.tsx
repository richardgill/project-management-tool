import React from 'react'
import Shell from '../Shell'
import UserSetup from '../UserSetup'

export default (props: any) => {
  return (
    <Shell>
      <UserSetup {...props} />
    </Shell>
  )
}
