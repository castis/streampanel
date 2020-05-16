const keysReducer = (acc, key) => `${acc},${key}=${obj[key]}`
const flatten = (obj) => Object.keys(obj).reduce(keysReducer, '')

export { flatten }
