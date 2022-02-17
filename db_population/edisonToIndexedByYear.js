// For use with EdisonOrder model
require('dotenv').config()
const csv = require('csvtojson')
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

const getAllIndexedCompanySuffixes =
  require('./getIndexedSuffixes').getAllIndexedCompanySuffixes

const COMPANY_DOMAIN = 'info@email.smiledirectclub.com'
const START_DATE = '2020-01-01'
const END_DATE = '2022-02-09'

async function transformOrdersIndexed() {
  const suffixMap = await getAllIndexedCompanySuffixes()

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

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    if (
      /Refund|refund|Return|return|cancelled|canceled|Arrived|shipment|out|Shipping|shipment/.test(
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
      // edisonRow.orderNumber = edisonRow.orderNumber.replace('BL782', '')

      // Get a specific range in the ordernumber
      // edisonRow.orderNumber = edisonRow.orderNumber.substr(5, 6)

      // 2 Remap one email to another
      // edisonRow.fromDomain = 'XXXX'

      // 3 If there is an order suffix, then remove it from the orderNumber

      // 4 If there is an order suffix, then remove it from the orderNumber
      let suffixMatch = suffixMap.find((suffix) => {
        return suffix.identifier === edisonRow.fromDomain
      })

      // if the suffix matches the last X characters of the orderNumber then remove it
      // ensures we do not replace other bits of the orderNumber, especially with numerical suffixes
      let suffixLength
      if (suffixMatch) {
        console.log(`${suffixMatch.identifier} ${suffixMatch.suffix}`)
        suffixLength = suffixMatch.suffix.length
      }
      if (
        suffixMatch &&
        edisonRow.orderNumber.substr(-suffixLength) === suffixMatch.suffix
      ) {
        // assuming the suffix matches above, use substr to remove it (faster than replace)
        const keepLength = edisonRow.orderNumber.length - suffixLength
        edisonRow.orderNumber = edisonRow.orderNumber.substr(0, keepLength)
      }

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
