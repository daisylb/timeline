import React, { ReactElement, useEffect, useState } from "react"

type Props = {}

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<any[][]|undefined>(undefined)
  useEffect(() => {
    const doUpdate = async ()=>{
      const resp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1sRTwyg_AfxmqtdP17Z0ynfeg7fHaKMnGCFAUC00iiXk',
        range: 'Sheet1!A2:D',
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
    }, 3000)
    doUpdate()
    return () => clearInterval(handle)
  }, [])
  if (value === undefined) return <div>Loading...</div>
  return <div>{JSON.stringify(value)}</div>
}