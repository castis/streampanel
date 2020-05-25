const flatten = obj => {
  return Object.keys(obj).reduce((acc, key) => `${acc},${key}=${obj[key]}`, '')
}

const pad = (n, z = 2) => ('00' + n).slice(-z)

function msToTime(s) {
  const ms = s % 1000
  s = (s - ms) / 1000
  const secs = s % 60
  s = (s - secs) / 60
  const mins = s % 60
  const hrs = (s - mins) / 60

  return (
    (hrs > 0 ? '${hrs}:' : '') +
    (mins > 0 ? '${mins}:' : '') +
    `${Math.abs(secs)}.${pad(Math.abs(ms), 2)}`
  )
}

export { flatten, pad, msToTime }
