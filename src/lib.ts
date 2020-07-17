import { DateTime } from "luxon"

export function serialToUnix(serial: number) {
  // https://stackoverflow.com/a/6154953/445398
  return (serial - 25569) * 86400
}

export function serialToDate(serial: number) {
  return new Date(serialToUnix(serial) * 1000)
}

/// Returns midnight local time on the given date.
export function dayFromStr(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new SyntaxError(dateStr)
  return new Date(`${dateStr}T00:00:00`)
}

export function hashStr(s: string) {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export function* range(start: number, stop: number, step: number) {
  for (let x = start; x < stop; x += step) yield x
}

export function startOfWeek(d: Date, next?: boolean) {
  const d_ = DateTime.fromJSDate(d)
  console.log(d_.toLocaleString({ weekday: "short" }))
  const maybeStart = d_.startOf("week")
  console.log(d_.toISOWeekDate(), maybeStart.toISOWeekDate())
  return maybeStart.toJSDate()
}

export function weekNum(d: Date) {
  const startOfWeekYear = startOfWeek(new Date(d.getFullYear(), 0, 4))
  const startOfThisWeek = startOfWeek(d)
  return
}
