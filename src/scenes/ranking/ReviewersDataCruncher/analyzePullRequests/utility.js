
export const flatten = arr => arr.reduce((acc, curr) => acc.concat(curr), [])

export const deepFlatten = arr => {
  return flatten(
    arr.map(item => {
      if (Array.isArray(item)) return deepFlatten(item)
      return item
    })
  )
}
