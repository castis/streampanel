const flatten = (obj) => {
    return Object.keys(obj).reduce((acc, key) => `${acc},${key}=${obj[key]}`, '')
}

export { flatten }
