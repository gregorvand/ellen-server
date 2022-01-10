// For use with EdisonOrder model
require('dotenv').config()
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

const getAllIndexedCompanySuffixes =
  require('./getIndexedSuffixes').getAllIndexedCompanySuffixes

async function autoEdisonToIndexed(limit) {
  // From local DB
  const allCompanyRows = await EdisonOrder.findAll({
    order: [['id', 'DESC']],
    limit: limit,
  })

  console.log(`reviewing ${allCompanyRows.length} rows`)

  const suffixMap = await getAllIndexedCompanySuffixes()

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    if (
      /Refund|refund|Return|return|cancelled|canceled|Arrived|out|Shipping|shipment/.test(
        edisonRow.subjectLine
      )
    ) {
      skippedCount++
      barProgress++
    } else {
      // If there is an order suffix associated with company...
      let suffixMatch = suffixMap.find((suffix) => {
        return suffix.identifier === edisonRow.fromDomain
      })

      // and the suffix matches the last X characters of the orderNumber then remove it
      // ensures we do not replace other bits of the orderNumber, especially with numerical suffixes
      let suffixLength
      if (suffixMatch) {
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
        `\n processed ${allCompanyRows.length} \n out of ${limit} | skipped ${skippedCount} \n`
      )
      process.exit(1)
    }
  })
}

module.exports = {
  autoEdisonToIndexed,
}
