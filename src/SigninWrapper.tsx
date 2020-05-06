import React, {
  ReactElement,
  useState,
  useEffect,
  ReactNode,
  createContext,
} from "react"
import OAuth2 from "client-oauth2"

export const TOKEN_STORE_KEY = "auth-token-2"

function useAuth() {
  const [token, setToken] = useState<string | undefined>(undefined)
  useEffect(() => {
    const auth = new OAuth2({
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

    if (window.location.hash) {
      auth.token.getToken(window.location).then((t) => {
        setToken(t.accessToken)
        localStorage.setItem(TOKEN_STORE_KEY, t.accessToken)
      })
      window.location.hash = ""
      return
    }
    const token = localStorage.getItem(TOKEN_STORE_KEY)
    if (token) {
      setToken(token)
      return
    }
    window.location.href = auth.token.getUri()
  }, [])
  return token
}

type Props = { children: ReactNode }

export const authCtx = createContext<string | undefined>(undefined)

export default function SigninWrapper(props: Props): ReactElement | null {
  const token = useAuth()
  console.log(token)
  if (token)
    return <authCtx.Provider value={token}>{props.children}</authCtx.Provider>
  return <div>waiting to get token</div>
}
