import React, {
  ReactElement,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react"
import { serialToUnix, serialToDate, hashStr } from "./lib"
import { TimelineEntry } from "./types"

declare module "csstype" {
  interface Properties {
    "--evt-start"?: number
    "--evt-end"?: number
  }
}

type Props = {
  entry: TimelineEntry
  category?: number
}

const FMT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

type Size = { blockSize: number; inlineSize: number }

export default function TimelineRow(props: Props): ReactElement | null {
  const [position, setPosition] = useState<null | "left" | "right">(null)
  const ro = useMemo(() => {
    let label: DOMRectReadOnly | null = null
    let bar: DOMRectReadOnly | null = null
    function resize() {
      if (!label || !bar) return
      else if (label.width < bar.width - 20) setPosition(null)
      else if (window.innerWidth - bar.right < label.width + 20)
        setPosition("left")
      else setPosition("right")
    }
    let labelEl: HTMLElement | null = null
    let barEl: HTMLElement | null = null
    const ro = new ResizeObserver((entries: any) => {
      for (const entry of entries) {
        if (entry.target === labelEl)
          label = labelEl?.getBoundingClientRect() ?? null
        else if (entry.target === barEl)
          bar = barEl?.getBoundingClientRect() ?? null
      }
      resize()
    })
    return {
      labelCb: (e: HTMLElement | null) => {
        if (!e) return
        labelEl = e
        label = e.getBoundingClientRect()
        ro.observe(e, { box: "border-box" })
        resize()
      },
      barCb: (e: HTMLElement | null) => {
        if (!e) return
        barEl = e
        bar = e.getBoundingClientRect()
        ro.observe(e, { box: "border-box" })
        resize()
      },
    }
  }, [])
  const labelRef = useCallback(ro.labelCb, [])
  const barRef = useCallback(ro.barCb, [])
  const startSecs = useMemo(() => props.entry.start.getTime(), [
    props.entry.start,
  ])
  const endSecs = useMemo(() => props.entry.end.getTime(), [props.entry.end])
  const endDisplay = useMemo(
    () => new Date(props.entry.end.getTime() - 86_400_000),
    [props.entry.end],
  )
  return (
    <div
      className={`timeline-row ${
        props.category !== undefined ? `color-${props.category}` : ""
      }`}
      style={{
        "--evt-start": startSecs,
        "--evt-end": endSecs,
      }}
    >
      <div className="timeline-inner" ref={barRef}>
        <div
          className={`timeline-label ${position ? `position-${position}` : ""}`}
          ref={labelRef}
        >
          <b>{props.entry.name}</b>
          <br />
          <small>
            {FMT.format(props.entry.start)}
            {endDisplay.getTime() !== props.entry.start.getTime() ? (
              <>
                &thinsp;&ndash;&thinsp;
                {FMT.format(endDisplay)}
              </>
            ) : null}
          </small>
        </div>
      </div>
    </div>
  )
}
