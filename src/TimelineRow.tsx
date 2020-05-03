import React, { ReactElement, useRef, useMemo, useState, useCallback } from "react"
import { serialToUnix, serialToDate } from "./lib"

declare module 'csstype' {
  interface Properties {
    '--evt-start'?: number; 
    '--evt-end'?: number;
  }
}

type Props = {
  startSerial: number,
  endSerial: number,
  label: string,
  kind: string,
}

const FMT = new Intl.DateTimeFormat(undefined, {month: 'short', day: 'numeric'})

type Size = {blockSize: number, inlineSize: number}

export default function TimelineRow(props: Props): ReactElement | null {
  const [position, setPosition] = useState<null|'left'|'right'>(null)
  const ro = useMemo(() => {
    let label: DOMRectReadOnly|null = null
    let bar: DOMRectReadOnly|null = null
    function resize(){
      console.log(labelEl, bar, label?.width)
      if (!label || !bar) return
      else if (label.width < bar.width - 20) setPosition(null)
      else if (window.innerWidth - bar.right < label.width + 20) setPosition('left')
      else setPosition('right')
    }
    let labelEl: HTMLElement | null = null
    let barEl: HTMLElement | null = null
    const ro = new ResizeObserver((entries: any) => {
      for (const entry of entries){
        if (entry.target === labelEl) label = labelEl?.getBoundingClientRect() ?? null
        else if (entry.target === barEl) bar = barEl?.getBoundingClientRect() ?? null
      }
      resize()
    })
    return {
      labelCb: (e: HTMLElement|null) => {
        if (!e) return
        labelEl = e
        label = e.getBoundingClientRect()
        ro.observe(e, {box:'border-box'})
        resize()
      },
      barCb: (e: HTMLElement|null) => {
        if (!e) return
        barEl = e
        bar = e.getBoundingClientRect()
        ro.observe(e, {box:'border-box'})
        resize()
      }
    }
  }, [])
  const labelRef = useCallback(ro.labelCb, [])
  const barRef = useCallback(ro.barCb, [])
  return <div
    className={`timeline-row kind-${props.kind}`}
    style={{
      "--evt-start": serialToUnix(props.startSerial),
      "--evt-end": serialToUnix(props.endSerial),
    }}>
      <div className="timeline-inner" ref={barRef}>
        <div className={`timeline-label ${position ? `position-${position}`:''}`} ref={labelRef}>
          <b>{props.label}</b><br />
          <small>{FMT.format(serialToDate(props.startSerial))}&thinsp;&ndash;&thinsp;{FMT.format(serialToDate(props.endSerial))}</small>
        </div>
      </div>
  </div>
}