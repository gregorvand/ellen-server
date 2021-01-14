const dayjs = require('dayjs');

// next helper: return company name if first instance of that company Id.
// skip if not the first instance.

const showDate = (date) => {
  console.log('date', date);
  return dayjs(date).format('DD/MM/YYYY');
}

module.exports.showDate = showDate;