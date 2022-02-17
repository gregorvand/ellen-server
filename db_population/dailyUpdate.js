const shell = require('shelljs')
const csv = require('csvtojson')
const scriptConstants = require('./script_constants')

const fileDateIdentifier = scriptConstants.FILE_DATE_IDENTIFIER
console.log('checking', fileDateIdentifier)

// Script to run every day to update the database with the latest data
// 1 Get the correct file from Edison S3
shell.exec(`aws s3 cp s3://ellen-receipts-data/receipts/${fileDateIdentifier}/ ../../edison_daily_updates/ --recursive
// `)

// // 2 Unzip gzip
shell.exec(`gunzip ../../edison_daily_updates/${fileDateIdentifier}_000.csv.gz`)
console.log('unzipped')

// 3 Import csv into temporary DB table for de-duplication
console.log('step 3 - Import to edison_receipt_temp')
shell.exec(`node ./autoImportCSV.js`)

// 4 De-duplicate the data in the temporary table based on checksum
console.log('step 4 - generate de-duped file')
shell.exec(`node ./autoWriteDeDuped.js`)

//
// 5 Import the deduped data into the main EdisonOrders table
console.log('step 5 - EdisonOrder import')
shell.exec(`node ./autoImportCSVtoEdisonOrders.js`)
// const { importAllCSVToOrders } = require('./autoImportCSVtoEdisonOrders')
// importAllCSVToOrders(fileDateIdentifier)

// 6 Do AOV and ACT run (also run during postValidateUpdate)
console.log('step 6 - AOV, ACT, TSI (may be some or all)')
// shell.exec('node getAOV.js')
// shell.exec('node getACT.js')
// shell.exec('node getTSI.js')

//
// 7 Understand how many records were created in EdisonOrders, get that count
// Use that count for how far back to use for reindexing to EdisonIndexedOrders

console.log('step 7 - do order reindex')
const { autoEdisonToIndexed } = require('./autoEdisonToIndexed')
async function getCSVFileLengthAndReindex() {
  const csvFilePath = `../../edison_daily_updates/${fileDateIdentifier}_000_deduped.csv`
  const csvData = await csv().fromFile(csvFilePath)
  const csvLength = csvData.length
  console.log('will be reindexing', csvLength)

  autoEdisonToIndexed(csvLength)

  // FINISH!
  console.log(`Finished processing and indexing ${fileDateIdentifier}`)
}

getCSVFileLengthAndReindex()
