const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)
dayjs.extend(timezone)

class Yesterday {
  constructor(date) {
    this.date = date
  }

  // get yesterday assuming we are New York (ie exchange timezone)
  dateYesterday() {
    return dayjs(this.date).add(-1, 'day')
  }
}

module.exports = Yesterday
