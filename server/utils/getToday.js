const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE)

class Today {
  constructor(date) {
    this.date = date
  }

  startOfToday() {
    return dayjs.tz(this.date).startOf('day').toISOString()
  }

  endOfToday() {
    return dayjs.tz(this.date).endOf('day').toISOString()
  }

  startOfTodayServer() {
    return dayjs(this.date).startOf('day').toISOString()
  }
}

function textDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

module.exports = { Today, textDate }
