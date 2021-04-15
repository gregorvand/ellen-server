const constants = require('../../server/utils/constants');

// Reasons list is 1-based,
// so this makes it easier to retrieve the reasons points values
const returnPointValueByReason = (reason) => {
  return constants.POINTS[reason-1]['value'];
};

module.exports.returnPointValueByReason = returnPointValueByReason;