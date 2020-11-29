import firebase from 'firebase/app'

import 'firebase/analytics'
import 'firebase/auth'
import 'firebase/database'

import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'

firebase.initializeApp({
  apiKey: 'AIzaSyDeFX0qf6yY3c3mXiUFp0cz3MI1u062tHs',
  authDomain: 'purse-project.firebaseapp.com',
  databaseURL: 'https://purse-project.firebaseio.com',
  projectId: 'purse-project',
  storageBucket: 'purse-project.appspot.com',
  messagingSenderId: '391254044536',
  appId: '1:391254044536:web:5f0751a8518771928de28d',
  measurementId: 'G-RPG7HF5LEP',
})

const analytics = firebase.analytics()
const auth = firebase.auth()
const database = firebase.database()

function useAuth() {
  /** @type {[firebase.auth.UserCredential, Dispatch<SetStateAction<firebase.auth.UserCredential>>]} */
  const [userCredential, setUserCredential] = useState()

  const uid =
    userCredential ? userCredential.user.uid
      : undefined

  useEffect(
    () => {
      auth.signInAnonymously().then(setUserCredential)
    },
    []
  )

  return { userCredential, uid }
}

function use(strings, ...keys) {
  const uid = auth.currentUser ? auth.currentUser.uid : undefined

  const pid = keys[keys.length - 1]
  const uidNotLast = pid !== uid && uid

  if (uidNotLast) {
    throw new Error('use: bad format; uid should be last')
  }

  let path = ''
  let pidpath = ''
  for (const i in strings) {
    const string = strings[i]
    const key = keys[i]
    const notOnUid = key !== uid && key && uid

    pidpath += string + (key ? key : '')
    path += string + (notOnUid ? key : '')
  }

}

export default firebase
export {
  analytics,
  auth,
  database,
  useAuth,
}
