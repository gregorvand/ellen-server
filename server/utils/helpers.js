// general helper functions

module.exports = {
  removeDuplicates(array = [], keyName) {
    if (keyName == '') {
      console.error('no key supplied to filter on')
    } else {
      console.log(keyName)
      let keys = array.map((object) => object[keyName])
      console.log(keys)
      const filtered = array.filter(
        (item, index) => !keys.includes(item[keyName], index + 1)
      )
      return filtered
    }
  },
}
