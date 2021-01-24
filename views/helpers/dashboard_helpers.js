const dayjs = require('dayjs');
const calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar)

// next helper: return company name if first instance of that company Id.
// skip if not the first instance.

const showDate = (date) => {
  return dayjs(date).calendar();
}

module.exports.showDate = showDate;