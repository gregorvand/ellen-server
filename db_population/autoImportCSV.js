const csv = require('csvtojson')
const db = require('../server/models/index')
const scriptConstants = require('./script_constants')

async function importCSV() {
  const csvFilePath = `../../edison_daily_updates/${scriptConstants.FILE_DATE_IDENTIFIER}_000.csv`
  const csvData = await csv().fromFile(csvFilePath)
  await db.sequelize.query(`TRUNCATE public.edison_receipts_temps`) // clean out old data
  await db.edison_receipts_temp.bulkCreate(csvData) // import new data
  await db.edison_receipts_monthly_calc.bulkCreate(csvData) // also import to receipts data table
}

importCSV()
