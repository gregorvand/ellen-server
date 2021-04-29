// These are simply client-side helpers
// All actions requiring DB lookup live currently in render_dashboard.js
// So that data is fetched BEFORE RENDER in those cases

const emailHelpers = require('../../server/modules/emailHelpers');
const serviceKlaviyo = require('../../server/services/third_party/klaviyo');
const constants = require('../../server/utils/constants');

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

const renderPointsReason = (reasonNumber) => {
  const reasons = constants.POINTS.map(value => value.key);
  return reasons[reasonNumber - 1];
}


module.exports.showDate = showDate;
module.exports.getEmailSubject = getEmailSubject;
module.exports.getInboundEmailAddress = getInboundEmailAddress;
module.exports.identifyKlaviyoUser = identifyKlaviyoUser;
module.exports.renderPointsReason = renderPointsReason;
