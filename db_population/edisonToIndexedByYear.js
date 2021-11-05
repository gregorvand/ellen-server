// For use with EdisonOrder model

require('dotenv').config()
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

// trial 1: get all records for a given company, store in memory, then reinsert based on indexed

// async function getData() {
//   const allCompanyRows = await EdisonOrder.findAll({
//     where: {
//       fromDomain: 'support@fragrantjewels.com',
//     },
//     limit: 1,
//   })

//   console.log(`retrieved ${allCompanyRows.length} record`, allCompanyRows[0])
// }

const COMPANY_DOMAIN = 'stat@wearfigs.com'
async function transformOrdersIndexed() {
  const allCompanyRows = await EdisonOrder.findAll({
    where: {
      // fromDomain: COMPANY_DOMAIN,
      emailDate: {
        [Op.gte]: dayjs('2020-07-01').toDate(),
        [Op.lte]: dayjs('2020-08-01').toDate(),
      },
    },
  })

  console.log(allCompanyRows.length)

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let insertCount = 0
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    indexedEdisonOrders.insertEdisonRowIndexed(edisonRow).then((result) => {
      result?.orderNumber != undefined ? insertCount++ : skippedCount++
      readCount++
      bar1.update(barProgress++)
      if (barProgress == allCompanyRows.length + 1) {
        bar1.stop()
        console.log(`processed ${allCompanyRows.length} for ${COMPANY_DOMAIN}`)
        process.exit(1)
      }
    })
  })
}

transformOrdersIndexed()
