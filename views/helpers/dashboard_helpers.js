const emailHelpers = require('../../server/modules/emailHelpers');
const serviceKlaviyo = require('../../server/services/klaviyo');

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

const getInboundEmailAddress = () => {
  return process.env.INBOUND_EMAIL;
};

const identifyKlaviyoUser = (user) => {
  serviceKlaviyo.identifyUserInternal(user.email);
}

module.exports.showDate = showDate;
module.exports.getEmailSubject = getEmailSubject;
module.exports.getInboundEmailAddress = getInboundEmailAddress;
module.exports.identifyKlaviyoUser = identifyKlaviyoUser;