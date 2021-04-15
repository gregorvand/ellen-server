const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
const env = process.env.NODE_ENV || 'development';

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(process.env.SYSTEM_TIMEZONE);
let date = dayjs;

module.exports.date = date;