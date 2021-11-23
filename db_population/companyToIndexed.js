// For use with EdisonOrder model

require('dotenv').config()
const csv = require('csvtojson')
const db = require('../server/models/index')
const cliProgress = require('cli-progress')
const Company = require('../server/models').Company
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

async function transformCompaniesIndexed() {
  // const allCompanies = await Company.findAll({
  //   where: {
  //     data_verified: true,
  //   },
  // })

  // For prod - from csv
  // const allCompanies = await csv().fromFile(
  //   '../edison_data/ellen_indexedco_21-11.csv'
  // )

  console.log(allCompanies.length)

  let barProgress = 1
  bar1.start(allCompanies.length, 0)
  let skippedCount = 0
  allCompanies.map(async (companyRow) => {
    const {
      nameIdentifier,
      emailIdentifier,
      orderPrefix,
      orderSuffix,
      industry,
      data_verified,
    } = companyRow

    let nameIdentifierEsc = nameIdentifier.replace(/'/g, "''")
    await db.sequelize.query(
      `INSERT INTO public."IndexedCompanies" (
        "nameIdentifier", "emailIdentifier", "orderPrefix", "orderSuffix", "industry", "data_verified",
      "createdAt", "updatedAt"
    ) VALUES (
        '${nameIdentifierEsc}', '${emailIdentifier}', '${orderPrefix}', '${orderSuffix}', '${industry}', '${data_verified}', NOW(), NOW()
    ) 
    ON CONFLICT ("emailIdentifier") DO NOTHING`
    )
    bar1.update(barProgress++)
    if (barProgress == allCompanies.length + 1) {
      bar1.stop()
      console.log(`\n processed ${allCompanies.length} \n`)
      process.exit(1)
    }
  })
}

transformCompaniesIndexed()
