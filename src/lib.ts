export function serialToUnix(serial: number){
  // https://stackoverflow.com/a/6154953/445398
  return (serial - 25569) * 86400
}

export function serialToDate(serial: number){
  return new Date(serialToUnix(serial) * 1000)
}