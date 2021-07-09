// general helper functions

module.exports = {
  /**
   * Filters an array of objects according to the supplied key name
   * @param {Array} array : array to filter
   * @param {String} keyName : key to filter on
   *
   * @returns {Array}
   */
  removeDuplicates(array = [], keyName = '') {
    if (keyName == '') {
      console.error('no key supplied to filter on')
    } else {
      let keys = array.map((object) => object[keyName])
      const filtered = array.filter(
        (item, index) => !keys.includes(item[keyName], index + 1)
      )
      return filtered
    }
  },
}
