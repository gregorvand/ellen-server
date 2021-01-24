const emailHelpers = require('../../server/modules/emailHelpers');

const dayjs = require('dayjs');
const calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar)

// next helper: return company name if first instance of that company Id.
// skip if not the first instance.

const showDate = (date) => {
  return dayjs(date).calendar();
}

const getEmailSubject = (email) => {
  return emailHelpers.getField(email.plainContent, 'envelope[subject]');
}

module.exports.showDate = showDate;
module.exports.getEmailSubject = getEmailSubject;