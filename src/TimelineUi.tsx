import React, { ReactElement, useMemo } from "react"
import TimelineRow from "./TimelineRow"
import { TimelineEntry } from "./types"

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
        "--tl-start": tlStart.getTime(),
        "--tl-end": tlEnd.getTime(),
      }}
    >
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
