import admin from 'firebase-admin'

export type Context = {
  user: admin.auth.DecodedIdToken
  token: string
}
