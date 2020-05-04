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
import { authCtx } from "./SigninWrapper"

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

type Props = {}
const spreadsheetId = "1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk"

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<any[][] | undefined>(undefined)
  const reloader = useRef(() => {})
  const token = useContext(authCtx)
  useEffect(() => {
    if (!token) return
    const doUpdate = async () => {
      const range = "Sheet1!A2:E"
      const resp = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=SERIAL_NUMBER`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } },
      )
      const json = await resp.json()
      setValue(json.values)
    }
    var latest = ""
    const handle = setInterval(async () => {
      const resp = await fetch(
        `https://www.googleapis.com/drive/v2/files/${spreadsheetId}?fields=version`,
        { headers: { Authorization: `Bearer ${token.accessToken}` } },
      )
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
