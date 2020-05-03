import React, { ReactElement, useState, useEffect } from "react"
import SigninWrapper from "./SigninWrapper"
import GetFromSpreadsheet from "./GetFromSpreadsheet"

type Argument1<T extends Function> = T extends (a: infer U, ...b: any[]) => any
  ? U
  : never

// Client ID and API key from the Developer Console
var CLIENT_ID =
  "772721993565-c1es60fgnbb0p862cnmio0vfeguecuia.apps.googleusercontent.com"
var API_KEY = "AIzaSyBOoB0xo26xp47UieZWZyoju_h5JwUEUhA"

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
]

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES =
  "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.metadata.readonly"

const INIT_ARGS = {
  apiKey: API_KEY,
  clientId: CLIENT_ID,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPES,
}

function useGapi(
  api: string,
  initArgs: Argument1<typeof gapi.client.init>,
): typeof gapi | undefined {
  const script = document.getElementById("gapi-script")
  if (!script)
    throw new Error(
      "The Google API script is not present or does not have an ID of gapi-script",
    )
  const [apiObj, setApi] = useState<typeof gapi | undefined>(undefined)
  useEffect(() => {
    const setup = () => {
      window.gapi.load(api, async () => {
        await gapi.client.init(initArgs)
        setApi(window.gapi)
      })
    }
    if (window.gapi === undefined)
      script.addEventListener("load", setup, { once: true })
    else setup()
  }, [])
  return apiObj
}

type Props = {}

export default function Root(props: Props): ReactElement | null {
  const gapi = useGapi("client:auth2", INIT_ARGS)
  if (gapi === undefined) return <div>Google APIs loading</div>
  return (
    <SigninWrapper>
      <GetFromSpreadsheet></GetFromSpreadsheet>
    </SigninWrapper>
  )
}
