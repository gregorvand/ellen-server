const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE);
let date = dayjs;

let todayDate = date.tz();
const endofTodayBySetTimezone = todayDate.endOf('day').toISOString();

let yesterdayDate = date.tz().add(-24, 'hours');
const startOfYesterdayBySetTimezone = yesterdayDate.startOf('day').toISOString();
  
module.exports.date = date;
module.exports.yesterday = yesterdayDate;
module.exports.today = todayDate;
module.exports.endofTodayBySetTimezone = endofTodayBySetTimezone;
module.exports.startOfYesterdayBySetTimezone = startOfYesterdayBySetTimezone;