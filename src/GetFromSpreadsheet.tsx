import React, { ReactElement, useEffect, useState, useMemo } from "react"
import { serialToDate, serialToUnix } from "./lib"
import TimelineRow from "./TimelineRow"

declare module 'csstype' {
  interface Properties {
    '--tl-start'?: number; 
    '--tl-end'?: number;
  }
}

type Row = [number, number|'', string, string]

function parse(data: any[][]): Row[]{
  const out: Row[] = []
  for (const datum of data){
    if (datum.length === 4 && typeof datum[0] === 'number' && (typeof datum[1] === 'number' || datum[1] === '') && typeof datum[2] === 'string' && typeof datum[3] === 'string') out.push(datum as Row)
    else console.warn('invalid row', datum)
  }
  return out
}

type Props = {}

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<any[][]|undefined>(undefined)
  useEffect(() => {
    const doUpdate = async ()=>{
      const resp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk',
        range: 'Sheet1!A2:E',
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "SERIAL_NUMBER"
      })
      setValue(resp.result.values)
    }
    var latest = ''
    const handle = setInterval(async () => {
      const resp2 = await gapi.client.drive.files.get({fileId: '1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk', fields: 'version'})
      const rev = resp2.result.version
      if (rev && rev != latest){
        latest = rev
        doUpdate()
      }
    }, 10_000)
    doUpdate()
    return () => clearInterval(handle)
  }, [])
  const parsed = useMemo(() => value ? parse(value):[], [value])
  const [tlStart, tlEnd] = useMemo(() => value?.reduce((prev, curr) => [Math.min(prev[0], curr[0]), Math.max(prev[1], curr[1])] as [number, number]) ?? [0, 0], [value])
  if (value === undefined) return <div>Loading...</div>
  return <div className="timeline" style={{"--tl-start": serialToUnix(tlStart), "--tl-end": serialToUnix(tlEnd)}}>
    {parsed.map((x, i) => <TimelineRow
      key={i}
      startSerial={x[0]}
      endSerial={x[1]||null}
      label={x[2]}
      kind={x[3]}
    ></TimelineRow>)}
    </div>
}