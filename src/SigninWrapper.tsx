import React, { ReactElement, useState, useEffect, ReactNode } from "react"

function useSignedIn() {
  const [s, setS] = useState(() =>
    gapi.auth2.getAuthInstance().isSignedIn.get(),
  )
  useEffect(() => {
    // TODO: can we unsubscribe on unmount?
    gapi.auth2.getAuthInstance().isSignedIn.listen(setS)
  }, [])
  return s
}

type Props = { children: ReactNode }

export default function SigninWrapper(props: Props): ReactElement | null {
  const signedIn = useSignedIn()
  if (signedIn)
    return (
      <>
        <button onClick={() => gapi.auth2.getAuthInstance().signOut()}>
          sign out
        </button>
        {props.children}
      </>
    )
  return (
    <div>
      not signed in
      <button onClick={() => gapi.auth2.getAuthInstance().signIn()}>
        sign in
      </button>
    </div>
  )
}
