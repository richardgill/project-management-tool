import * as firebaseui from 'firebaseui'
import React from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import styled from 'styled-components'
import firebase from '../../lib/firebase'
import Shell from '../Shell'
import { FlexBox } from '../core/Box'

const uiConfig: (redirect: string) => firebaseui.auth.Config = redirect => {
  return {
    autoUpgradeAnonymousUsers: true,
    signInFlow: 'redirect',
    signInSuccessUrl: redirect,
    signInOptions: [
      {
        autoUpgradeAnonymousUsers: true,
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
      }
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        return true
      },
      signInFailure: async error => {
        if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
          console.log('sign in failure')
          console.error(error)
          return
        }
        await firebase.auth().signInWithCredential(error.credential)
        window.location.href = redirect
      }
    }
  }
}

const FirebaseAuth = styled(StyledFirebaseAuth)`
  min-width: 1000px;
`

export default (props: any) => {
  return (
    <Shell>
      <FlexBox flex={1} alignItems="center" mt={4}>
        <FirebaseAuth uiConfig={uiConfig(props.queryParams.redirect || '/')} firebaseAuth={firebase.auth()} />
      </FlexBox>
    </Shell>
  )
}
