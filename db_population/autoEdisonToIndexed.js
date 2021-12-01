// For use with EdisonOrder model
require('dotenv').config()
const cliProgress = require('cli-progress')
const EdisonOrder = require('../server/models').EdisonOrder
const indexedEdisonOrders = require('../server/controllers/indexedEdisonOrders')
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

async function autoEdisonToIndexed(limit) {
  // From local DB
  const allCompanyRows = await EdisonOrder.findAll({
    order: [['id', 'DESC']],
    limit: limit,
  })

  console.log(`reviewing ${allCompanyRows.length} rows`)

  let barProgress = 1
  bar1.start(allCompanyRows.length, 0)
  let readCount = 0
  let skippedCount = 0
  allCompanyRows.map(async (edisonRow) => {
    if (/Refund|refund|Return|return|cancelled/.test(edisonRow.subjectLine)) {
      skippedCount++
      barProgress++
    } else {
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
