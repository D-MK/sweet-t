import {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '@/lib/firebase'

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google login failed:', error)
    throw error
  }
}

export async function loginWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider)
    return result.user
  } catch (error) {
    console.error('GitHub login failed:', error)
    throw error
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email signup failed:', error)
    throw error
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Email login failed:', error)
    throw error
  }
}

export async function logout() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  }
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser
}

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}
