import React, { ReactElement, useMemo } from "react"
import TimelineRow from "./TimelineRow"
import { TimelineEntry } from "./types"
import { range, startOfWeek } from "./lib"
import { DateTime } from "luxon"

type Props = { timeline: TimelineEntry[] }

const accInitial = [new Date(86_400_000_000_000), new Date(0)] as const

export default function TimelineUi(props: Props): ReactElement | null {
  const [tlStart, tlEnd] = useMemo(
    () =>
      props.timeline.reduce<readonly [Date, Date]>(
        ([accStart, accEnd], entry) => [
          accStart.getTime() < entry.start.getTime() ? accStart : entry.start,
          accEnd.getTime() > entry.end.getTime() ? accEnd : entry.end,
        ],
        accInitial,
      ),
    [props.timeline],
  )

  const startOfFirstWeek = useMemo(
    () => DateTime.fromJSDate(tlStart).startOf("week").toJSDate(),
    [tlStart],
  )
  const endOfLastWeek = useMemo(
    () => DateTime.fromJSDate(tlEnd).endOf("week").toJSDate(),
    [tlEnd],
  )

  const categories = useMemo(() => {
    const prefixMap = new Map<string, number>()
    const output = new Map<TimelineEntry, number>()
    var counter = 0
    for (const entry of props.timeline) {
      const category = /^.*\:/.exec(entry.name)?.[0]
      if (!category) continue
      if (!prefixMap.has(category)) {
        prefixMap.set(category, counter)
        counter = (counter + 1) % 6
      }
      output.set(entry, prefixMap.get(category)!)
    }
    return output
  }, [props.timeline])
  return (
    <div
      className="timeline"
      style={{
        "--tl-start": startOfFirstWeek.getTime(),
        "--tl-end": endOfLastWeek.getTime(),
      }}
    >
      <NowMarker />
      {Array.from(
        range(
          startOfFirstWeek.getTime(),
          endOfLastWeek.getTime(),
          86_400_000 * 7,
        ),
      ).map((x) => (
        <WeekMarker weekStart={DateTime.fromMillis(x)} />
      ))}
      {props.timeline.map((x, i) => (
        <TimelineRow
          key={i}
          entry={x}
          category={categories.get(x)}
        ></TimelineRow>
      ))}
    </div>
  )
}

type WeekMarkerProps = { weekStart: DateTime }

function WeekMarker(props: WeekMarkerProps): ReactElement | null {
  return (
    <div
      className="week-marker"
      style={{ "--position": props.weekStart.toMillis() }}
    >
      {props.weekStart.weekNumber}
    </div>
  )
}

function NowMarker(props: {}): ReactElement | null {
  const now = Date.now()
  return <div className="now-marker" style={{ "--position": now }} />
}
