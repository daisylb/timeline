import React, {
  ReactElement,
  useEffect,
  useState,
  useMemo,
  useRef,
  useContext,
} from "react"
import { serialToDate, serialToUnix } from "./lib"
import TimelineRow from "./TimelineRow"
import loadScript from "./loadScript"
import { useAuthToken } from "./auth"

declare module "csstype" {
  interface Properties {
    "--tl-start"?: number
    "--tl-end"?: number
  }
}

type Row = [number, number | "", string, string]

function parse(data: any[][]): Row[] {
  const out: Row[] = []
  for (const datum of data) {
    if (
      datum.length === 4 &&
      typeof datum[0] === "number" &&
      (typeof datum[1] === "number" || datum[1] === "") &&
      typeof datum[2] === "string" &&
      typeof datum[3] === "string"
    )
      out.push(datum as Row)
    else console.warn("invalid row", datum)
  }
  return out
}

function loadSheet(key: string) {
  return new Promise((res) => {
    loadScript("https://apis.google.com/js/api.js").then(() =>
      gapi.load("picker", () => {
        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.SPREADSHEETS)
          .setAppId("772721993565")
          .setOAuthToken(key)
          .setDeveloperKey("AIzaSyBOoB0xo26xp47UieZWZyoju_h5JwUEUhA")
          .setCallback((evt: any) => {
            if (
              evt.action === google.picker.Action.PICKED ||
              evt.action === google.picker.Action.CANCEL
            )
              res(evt)
          })
          .build()
        picker.setVisible(true)
      }),
    )
  })
}

type Props = {}
const spreadsheetId = "1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk"

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<any[][] | undefined>(undefined)
  const [needsAuth, setNeedsAuth] = useState(false)
  const reloader = useRef(() => {})
  const [token, tokenInvalid] = useAuthToken()
  useEffect(() => {
    if (!token) return
    const doUpdate = async () => {
      const range = "Sheet1!A2:E"
      const resp = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (resp.status == 404) setNeedsAuth(true)
      else if (resp.status !== 200)
        console.warn("got unexpected response", resp)
      else {
        const json = await resp.json()
        setValue(json.values)
      }
    }
    var latest = ""
    const handle = setInterval(async () => {
      const resp = await fetch(
        `https://www.googleapis.com/drive/v2/files/${spreadsheetId}?fields=version`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (resp.status !== 200) return
      const json = await resp.json()
      const rev = json.version
      if (rev && rev != latest) {
        latest = rev
        doUpdate()
      }
    }, 10_000)
    doUpdate()
    reloader.current = doUpdate
    return () => clearInterval(handle)
  }, [token])
  const parsed = useMemo(() => (value ? parse(value) : []), [value])
  const [tlStart, tlEnd] = useMemo(
    () =>
      (parsed &&
        parsed.length &&
        parsed
          .map((x) => [x[0], x[1] || 0])
          .filter((x) => isFinite(x[0]) && isFinite(x[1]))
          .reduce(
            (prev, curr) =>
              [Math.min(prev[0], curr[0]), Math.max(prev[1], curr[1])] as [
                number,
                number,
              ],
          )) || [0, 0],
    [value],
  )
  if (needsAuth)
    return (
      <div>
        <p>
          The first time you load this page, you need to open the{" "}
          <b>PyConline Timeline</b> spreadsheet in the Google Drive file picker.
        </p>
        <p>
          This lets this app get access to that one file without requesting
          access to your entire Drive.
        </p>
        <p>
          You might have to allow third-party cookies or temporarily disable
          tools like Privacy Badger, but you can turn them back on immediately
          afterwards, and you'll only have to do this once.
        </p>

        <button
          onClick={async () => {
            const v = await loadSheet(token)
            console.log(v)
            setNeedsAuth(false)
            reloader.current()
          }}
        >
          open the picker!
        </button>
      </div>
    )
  if (value === undefined) return <div>Loading...</div>
  return (
    <>
      <button onClick={() => reloader.current()}>reload</button>
      <a
        href="https://docs.google.com/spreadsheets/d/1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk/edit#gid=0"
        target="_blank"
      >
        edit
      </a>
      <div
        className="timeline"
        style={{
          "--tl-start": serialToUnix(tlStart),
          "--tl-end": serialToUnix(tlEnd),
        }}
      >
        {parsed.map((x, i) => (
          <TimelineRow
            key={i}
            startSerial={x[0]}
            endSerial={x[1] || null}
            label={x[2]}
            kind={x[3]}
          ></TimelineRow>
        ))}
      </div>
    </>
  )
}
