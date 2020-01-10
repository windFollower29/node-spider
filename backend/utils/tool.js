

function deepSet (obj, path, val) {
  !Array.isArray(path)
    && (path = path.split('.'))

  const key = path.shift()

  if (path.length) {

    obj[key] = {}
    deepSet(obj[key], path)

  } else {
    obj[key] = val
  }
}


module.exports = {
  deepSet
}