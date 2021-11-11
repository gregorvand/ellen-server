// For use with EdisonOrder model

require('dotenv').config()
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

const COMPANY_DOMAIN = 'service@rhone.com'
const START_DATE = '2017-01-01'
const END_DATE = '2021-11-01'
async function transformOrdersIndexed() {
  const allCompanyRows = await EdisonOrder.findAll({
    where: {
      fromDomain: COMPANY_DOMAIN,
      emailDate: {
        [Op.gte]: dayjs(START_DATE).toDate(),
        [Op.lte]: dayjs(END_DATE).toDate(),
      },
    },
  })

  console.log(allCompanyRows.length)

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    if (/Refund|refund|Return|return|delivered/.test(edisonRow.subjectLine)) {
      // console.log(`ignoring ${edisonRow.orderNumber} ${edisonRow.subjectLine}`)
      skippedCount++
    } else {
      await indexedEdisonOrders.insertEdisonRowIndexed(edisonRow)
      readCount++
    }
    bar1.update(barProgress++)
    if (barProgress == allCompanyRows.length + 1) {
      console.log(
        `processed ${allCompanyRows.length} for ${START_DATE} to ${END_DATE} | skipped ${skippedCount}\n`
      )
      bar1.stop()
      process.exit(1)
    }
  })
}

transformOrdersIndexed()
