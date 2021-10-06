const dayjs = require('dayjs')

function assignDateIdentifier(companyID, date) {
  return `${companyID}${date.format(
    process.env.DATASET_DATE_FORMAT || 'MMDDYYYY'
  )}`
}

function constructDateIdentifier(companyID, month, year) {
  let fullDate = dayjs()
    .set('date', 1)
    .set('month', padNumber(month))
    .set('year', year)
  return assignDateIdentifier(companyID, fullDate)
}

// adds leading zero to month if 1-9
function padNumber(num, len = 2) {
  return `${num}`.padStart(len, '0')
}

module.exports = {
  assignDateIdentifier: assignDateIdentifier,
  constructDateIdentifier: constructDateIdentifier,
}
