// For use with EdisonOrder model

require('dotenv').config()
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

// const COMPANY_DOMAIN = 'stat@wearfigs.com'
const START_DATE = '2020-10-20'
const END_DATE = '2020-10-31'
async function transformOrdersIndexed() {
  const allCompanyRows = await EdisonOrder.findAll({
    where: {
      // fromDomain: COMPANY_DOMAIN,
      emailDate: {
        [Op.gte]: dayjs(START_DATE).toDate(),
        [Op.lte]: dayjs(END_DATE).toDate(),
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
        console.log(
          `processed ${allCompanyRows.length} for ${START_DATE} to ${END_DATE} `
        )
        process.exit(1)
      }
    })
  })
}

transformOrdersIndexed()
