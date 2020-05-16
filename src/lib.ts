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
