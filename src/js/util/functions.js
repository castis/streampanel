function flatten(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        return `${acc},${key}=${obj[key]}`
    }, '')
}

export { flatten }
