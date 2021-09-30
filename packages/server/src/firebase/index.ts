import firebaseAdmin, { ServiceAccount } from 'firebase-admin'

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT as string, 'base64').toString())

const buildFirebase = (name: string, databaseAuthVariableOverride: { uid: string } | undefined = undefined) => {
  return firebaseAdmin.initializeApp(
    {
      databaseURL: '',
      credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
      databaseAuthVariableOverride,
    },
    name,
  )
}
const adminFirebase = buildFirebase('webServer')

export default adminFirebase
