import React, {
  ReactElement,
  useContext,
  createContext,
  ReactNode,
  useState,
  useCallback,
} from "react"

const STORAGE_KEY = "auth-token-3"

const authCtx = createContext<[string, VoidFunction] | null>(null)

export function useAuthToken() {
  const ctx = useContext(authCtx)
  if (ctx === null)
    throw new Error("There is no authentication provider mounted")
  return ctx
}

const setTokenCallbackCtx = createContext<((t: string) => void) | null>(null)

export function useSetTokenCallback() {
  const ctx = useContext(setTokenCallbackCtx)
  if (ctx === null)
    throw new Error("There is no authentication provider mounted")
  return ctx
}

type Props = { unauthenticatedView: ReactNode; children: ReactNode }

export function AuthProvider(props: Props): ReactElement | null {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(STORAGE_KEY),
  )
  const reauthCallback = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [setToken])
  const tokenSetCallback = useCallback(
    (v: string) => {
      localStorage.setItem(STORAGE_KEY, v)
      setToken(v)
    },
    [setToken],
  )
  if (token === null)
    return (
      <setTokenCallbackCtx.Provider value={tokenSetCallback}>
        {props.unauthenticatedView}
      </setTokenCallbackCtx.Provider>
    )
  return (
    <authCtx.Provider value={[token, reauthCallback]}>
      {props.children}
    </authCtx.Provider>
  )
}
