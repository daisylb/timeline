import React, {
  ReactElement,
  useState,
  useEffect,
  ReactNode,
  createContext,
} from "react"
import OAuth2 from "client-oauth2"
import { AuthProvider, useSetTokenCallback } from "./auth"

export const TOKEN_STORE_KEY = "auth-token-2"

const OAUTH = new OAuth2({
  clientId:
    "772721993565-c1es60fgnbb0p862cnmio0vfeguecuia.apps.googleusercontent.com",
  authorizationUri: "https://accounts.google.com/o/oauth2/v2/auth",
  redirectUri: `${window.location.protocol}//${window.location.host}/`,
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.install",
    "profile",
  ],
})

type Props = {}

export const authCtx = createContext<string | undefined>(undefined)

export default function LoginUi(props: Props): ReactElement | null {
  const setToken = useSetTokenCallback()
  useEffect(() => {
    // check the URI hash for the token
    if (window.location.hash) {
      OAUTH.token.getToken(window.location).then((t) => {
        setToken(t.accessToken)
        window.location.hash = ""
      })
    }
  }, [setToken])
  return <a href={OAUTH.token.getUri()}>Click here to log in </a>
}
