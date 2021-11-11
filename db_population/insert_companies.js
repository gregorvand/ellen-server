require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const db = require('../server/models/index')

// get data
const csvFilePath = '../edison_data/export_ozfmn.csv'

async function convertCSV() {
  const jsonArray = await csv().fromFile(csvFilePath)
  return jsonArray
}

async function createCompany(dataRow) {
  let itemResllerEscaped = dataRow.item_reseller.replace(/'/g, "''")
  const createdRecord = await db.sequelize.query(
    `INSERT INTO public."Companies" (
      "nameIdentifier", "emailIdentifier", "orderPrefix", "industry",
    "createdAt", "updatedAt"
  ) VALUES (
      '${itemResllerEscaped}', '${dataRow.from_domain}', '#', 'Shopify',
      NOW(), NOW()
  ) 
 ON CONFLICT ("emailIdentifier") DO NOTHING`
  )

  return createdRecord
}
async function insertEdisonCompanies() {
  const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  const data = await convertCSV()
  let barProgress = 1
  let success = 0
  let skipped = 0
  bar1.start(data.length, 0)

  // MULTI ROW
  // comment out below and enable @ 60 to debug one row
  data.map(async (edisonRow) => {
    try {
      let insertedRow = await createCompany(edisonRow)
      // console.log(insertedRow)
      if (insertedRow[0].length > 0) {
        success++
      } else {
        skipped++
      }
      bar1.update(barProgress)
      barProgress++
      if (barProgress === data.length + 1) {
        bar1.stop()
        console.log(`\nAdded ${success} new companies, skipped ${skipped}\n`)
        process.exit(1)
      }
    } catch (error) {
      barProgress++
      console.log(error)
    }
  })
}

// run
insertEdisonCompanies()
