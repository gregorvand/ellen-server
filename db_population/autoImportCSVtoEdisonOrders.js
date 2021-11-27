// Like import_csv_ordersV2 but to be used as part of daily update script
require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const ordersControllerEdison = require('../server/controllers/edisonOrders')

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
const scriptConstants = require('./script_constants')

async function importAllCSVToOrders(fileDateIdentifier) {
  const csvFilePath = `../../edison_daily_updates/${fileDateIdentifier}_000_deduped.csv`

  async function convertCSV(csvFilePath) {
    const jsonArray = await csv().fromFile(csvFilePath)
    return jsonArray
  }

  const data = await convertCSV(csvFilePath)

  // purely for console output formatting
  let fileName = csvFilePath.split('/')

  let barProgress = 1
  bar1.start(data.length, 0)
  let insertCount = 0
  let readCount = 0
  let skippedCount = 0
  data.map(async (edisonRow) => {
    ordersControllerEdison.insertEdisonRowNoId(edisonRow).then((result) => {
      result?.orderNumber != undefined ? insertCount++ : skippedCount++
      readCount++
      bar1.update(barProgress++)
      if (barProgress == data.length + 1) {
        bar1.stop()
        console.log('added', insertCount)
        console.log(`processed ${fileName[fileName.length - 1]}\n`)
        return insertCount
      }
    })
  })
}

importAllCSVToOrders(scriptConstants.FILE_DATE_IDENTIFIER)

module.exports = { importAllCSVToOrders }
