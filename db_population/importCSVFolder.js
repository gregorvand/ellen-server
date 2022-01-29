const csv = require('csvtojson')
const db = require('../server/models/index')
const fs = require('fs')

const AOV_MONTH = 12

// Designed to import a full (ie not already de-duplicated) set of order data from a given month
// This is designed to be run once per month
// The getAOV function selects disctinct (for e.g.) handle this
async function importCSVs() {
  // const csvFilePath = `../../edison_daily_updates/dec_21_test/2021-12-22_000.csv`
  const folderPath = `../../edison_daily_updates/${AOV_MONTH}-21/`
  // await db.sequelize.query(
  //   `TRUNCATE public.edison_receipts_monthly_calcs RESTART IDENTITY`
  // ) // clean out old data
  const allFiles = fs.readdirSync(folderPath)

  // Loop through files and ingest them to edison_receipts_monthly_calcs
  // using for..of to ensure promises of bulkCreate are resolved before moving on
  for (file of allFiles) {
    if (file !== '.DS_Store') {
      console.log(file)
      let csvData = await csv().fromFile(`${folderPath}${file}`)
      try {
        await db.edison_receipts_monthly_calc.bulkCreate(csvData)
        console.log(`done importing ${file}`)
      } catch (error) {
        console.error(`could not import ${file}`)
      }
    }
  }
}

// Import a set of CSV files from a folder
importCSVs()
