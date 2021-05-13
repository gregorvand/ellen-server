const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE);
let date = dayjs.tz();
let dayJs = dayjs;
  
module.exports.dayJs = dayJs;
module.exports.date = date;