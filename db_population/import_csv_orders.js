require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const ordersControllerEdison = require('../server/controllers/ordersByEdison')

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

// get data
const csvFilePath = '../edison_data/export_clbcf_013.csv'
const csvFilesPathsArray = [
  '../edison_data/export_clbcf_012.csv',
  '../edison_data/export_clbcf_013.csv',
]
// const csvFilePath = '../edison_data/export_hypershop.csv'

async function convertAndHandleCSVtoDB(csvFilesPathsArray) {
  csvFilesPathsArray.forEach((csvFile) => {
    importAllCSVToOrders(csvFile)
  })
}

// convertAndHandleCSVtoDB(csvFilesPathsArray)
importAllCSVToOrders(csvFilePath)

async function convertCSV(csvFilePath) {
  const jsonArray = await csv({
    // parse order number here to number format for later checks
    colParser: { order_number: 'number' },
  }).fromFile(csvFilePath)
  return jsonArray
}

async function importAllCSVToOrders(csvFilePath) {
  const data = await convertCSV(csvFilePath)

  let fileName = csvFilePath.split('/')
  console.log(`processing ${fileName[fileName.length - 1]}`)

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
        process.exit(1)
      }
    })
  })
}
