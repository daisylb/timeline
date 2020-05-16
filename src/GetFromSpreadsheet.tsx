import React, { ReactElement, useEffect, useState } from "react"
import { useAuthToken } from "./auth"
import { TimelineEntry } from "./types"
import { dayFromStr } from "./lib"
import TimelineUi from "./TimelineUi"

declare module "csstype" {
  interface Properties {
    "--tl-start"?: number
    "--tl-end"?: number
  }
}

type Props = {}

const calendarId = "ojd2lrk8sn238lmvufqequsur0@group.calendar.google.com"

export default function GetFromSpreadsheet(props: Props): ReactElement | null {
  const [value, setValue] = useState<TimelineEntry[] | undefined>(undefined)
  const [token, resetToken] = useAuthToken()
  useEffect(() => {
    fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((v) => v.json())
      .then((v) => {
        console.log(v)
        setValue(
          (v.items as any[])
            .map(
              (item: any) =>
                ({
                  name: item.summary,
                  start: dayFromStr(item.start.date),
                  end: dayFromStr(item.end.date),
                } as TimelineEntry),
            )
            .sort((x, y) => x.start.getTime() - y.start.getTime()),
        )
      })
  }, [token, resetToken])

  return (
    <>
      <button onClick={() => resetToken()}>log out</button>
      {value && <TimelineUi timeline={value}></TimelineUi>}
    </>
  )
}
