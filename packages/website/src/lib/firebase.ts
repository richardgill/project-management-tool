import * as firebase from 'firebase/app'
import 'firebase/auth'
import config from '../config'

if (!firebase.apps.length) {
  console.log(config.firebaseConfig)
  firebase.initializeApp(config.firebaseConfig)
}

export const getCurrentUser = () => {
  return new Promise<firebase.User | null>((resolve, reject) => {
    if (firebase.auth().currentUser) {
      return resolve(firebase.auth().currentUser)
    }
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

let signInAnonymouslyPromise: Promise<firebase.auth.UserCredential> | null = null

export const getCurrentUserOrSignInAnonymously = async (forceSignInAnonymously = false): Promise<firebase.User | null> => {
  const user = await getCurrentUser()
  if (user) {
    return user
  }
  if (forceSignInAnonymously || !signInAnonymouslyPromise) {
    console.log('Sign in anonymously!!!')

    signInAnonymouslyPromise = firebase.auth().signInAnonymously()
  }
  try {
    return (await signInAnonymouslyPromise).user
  } catch (error) {
    console.error(`Problem anonymously signing in: ${error}. Retrying...`)
    return await getCurrentUserOrSignInAnonymously(true)
  }
}
;(async () => {
  await getCurrentUserOrSignInAnonymously()
})()

export default firebase
