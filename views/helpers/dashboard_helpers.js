const dayjs = require('dayjs');

const showDate = (date) => {
  console.log('date', date);
  return dayjs(date).format('DD/MM/YYYY');
}

module.exports.showDate = showDate;