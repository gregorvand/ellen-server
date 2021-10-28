require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const ordersControllerEdison = require('../server/controllers/edisonOrders')

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

// get data
const csvFilePath = '../edison_data/export_fkdru_004.csv'

// convertAndHandleCSVtoDB(csvFilesPathsArray)
importAllCSVToOrders(csvFilePath)

async function convertCSV(csvFilePath) {
  const jsonArray = await csv().fromFile(csvFilePath)
  return jsonArray
}

async function importAllCSVToOrders(csvFilePath) {
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
        console.log(`processed ${fileName[fileName.length - 1]}`)
        process.exit(1)
      }
    })
  })
}
