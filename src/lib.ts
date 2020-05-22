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
  const daysToSubtract = (d.getDay() || 7) - 2
  const millisecondsToSubtract =
    (d.getTime() - d.getTimezoneOffset() * 60_000) % 86_400_000
  return new Date(
    d.getTime() -
      daysToSubtract * 86_400_000 -
      millisecondsToSubtract +
      (next && (daysToSubtract || millisecondsToSubtract) ? 86_400_000 * 7 : 0),
  )
}
