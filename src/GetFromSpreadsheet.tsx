import React, { ReactElement, useEffect, useState, useMemo } from "react"
import { serialToDate, serialToUnix } from "./lib"
import TimelineRow from "./TimelineRow"

declare module 'csstype' {
  interface Properties {
    '--tl-start'?: number; 
    '--tl-end'?: number;
  }
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
  const [tlStart, tlEnd] = useMemo(() => value?.reduce((prev, curr) => [Math.min(prev[0], curr[0]), Math.max(prev[1], curr[1])] as [number, number]) ?? [0, 0], [value])
  if (value === undefined) return <div>Loading...</div>
  return <div className="timeline" style={{"--tl-start": serialToUnix(tlStart), "--tl-end": serialToUnix(tlEnd)}}>
    {value.map((x, i) => <TimelineRow
      key={i}
      startSerial={x[0]}
      endSerial={x[1]}
      label={x[2]}
      kind={x[3]}
    ></TimelineRow>)}
    </div>
}