const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE);
let date = dayjs;

let todayDay = date.tz();
const endofTodayBySetTimezone = todayDay.endOf('day').toISOString();

let yesterday = date.tz().add(-24, 'hours');
const startOfYesterdayBySetTimezone = yesterday.startOf('day').toISOString();
  
module.exports.date = date;
module.exports.endofTodayBySetTimezone = endofTodayBySetTimezone;
module.exports.startOfYesterdayBySetTimezone = startOfYesterdayBySetTimezone;