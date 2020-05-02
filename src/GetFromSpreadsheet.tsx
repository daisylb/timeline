import React, { ReactElement, useEffect, useState } from "react"

type Props = {}

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<any[][]|undefined>(undefined)
  useEffect(() => {
    ;(async ()=>{
      const resp = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Class Data!A2:E',
      })
      console.log(resp)
      setValue(resp.result.values)
    })()
  }, [])
  if (value === undefined) return <div>Loading...</div>
  return <div>{JSON.stringify(value)}</div>
}