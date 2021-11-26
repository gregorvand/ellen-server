// For use with EdisonOrder model
require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

// const COMPANY_DOMAIN = 'info@soylent.com'
// const START_DATE = '2017-01-01'
// const END_DATE = '2021-11-01'
async function transformOrdersIndexed() {
  // From local DB
  const allCompanyRows = await EdisonOrder.findAll({
    where: {
      fromDomain: COMPANY_DOMAIN,
      emailDate: {
        [Op.gte]: dayjs(START_DATE).toDate(),
        [Op.lte]: dayjs(END_DATE).toDate(),
      },
    },
  })

  // from file
  // const allCompanyRows = await csv().fromFile('../edison_data/new_test.csv')

  console.log(allCompanyRows.length)

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    if (
      /Refund|refund|Return|return/.test(
        edisonRow.subjectLine
      )

      // Or any other conditions
      // || edisonRow.itemReseller !== 'Nisolo'
    ) {
      // console.log(`ignoring ${edisonRow.orderNumber} ${edisonRow.subjectLine}`)
      skippedCount++
      barProgress++
    } else {
      // ***OPTIONS**

      // 1 Replace parts of ordernumber if required as a patch
      // edisonRow.orderNumber = edisonRow.orderNumber.replace('', '')

      // 2 Remap one email to another
      // edisonRow.fromDomain = 'XXXX'

      await indexedEdisonOrders.insertEdisonRowIndexed(edisonRow)
      readCount++
      barProgress++
    }
    bar1.update(barProgress)
    if (barProgress == allCompanyRows.length + 1) {
      bar1.stop()
      console.log(
        `\n processed ${allCompanyRows.length} \n for ${START_DATE} to ${END_DATE} | skipped ${skippedCount} \n ${COMPANY_DOMAIN}`
      )
      process.exit(1)
    }
  })
}

transformOrdersIndexed()
