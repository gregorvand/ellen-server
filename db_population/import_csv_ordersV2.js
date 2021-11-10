// For use with EdisonOrder model

require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const ordersControllerEdison = require('../server/controllers/edisonOrders')

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
const fs = require('fs')
const dirLength = fs.readdirSync('../edison_data').length

// padds iterator to match filename syntax
function padNumber(num, len = 3) {
  return `${num}`.padStart(len, '0')
}

const START_AT_FILE = 1 // filenumber to start at. e.g. '1' for xxxx_001.csv
const DOWNLOAD_IDENTIFIER = 'xxxxx' // csvexplorer adds a unique identifier to exports

// Run the below function when file is run
importAllCSVToOrders()

async function importAllCSVToOrders(fileIterator = START_AT_FILE) {
  const csvFilePath = `../edison_data/export_${DOWNLOAD_IDENTIFIER}_${padNumber(
    fileIterator
  )}.csv`

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
        console.log(`processed ${fileName[fileName.length - 1]}`)

        // chunk through every file in the directory
        if (fileIterator < dirLength - 1) {
          fileIterator += 1
          // callback
          importAllCSVToOrders(fileIterator)
        } else {
          process.exit(1)
        }
      }
    })
  })
}
