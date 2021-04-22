const { Modules } = require('@sentry/node/dist/integrations');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE);
let date = dayjs.tz();

let todayDate = date.startOf('day');
const startofTodayBySetTimezone = todayDate.toISOString();

const endofTodayBySetTimezone = date.endOf('day').toISOString();
console.log(endofTodayBySetTimezone);

let yesterdayDate = todayDate.add('-24', 'hours');
const startofYesterdayBySetTimezone = yesterdayDate.tz().startOf('day').toISOString();
  
module.exports.date = date;
module.exports.yesterday = yesterdayDate;
module.exports.today = todayDate;
module.exports.startofTodayBySetTimezone = startofTodayBySetTimezone;
module.exports.endofTodayBySetTimezone = endofTodayBySetTimezone;
module.exports.startofYesterdayBySetTimezone = startofYesterdayBySetTimezone;