// For use with EdisonOrder model

require('dotenv').config()
const csv = require('csvtojson')
const commander = require('commander')
const db = require('../server/models/index')
const cliProgress = require('cli-progress')
const Company = require('../server/models').Company
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
const { textDate } = require('../server/utils/getToday')

const today = textDate()

commander
  // .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-l, --local', 'Local DB actions')
  .option('-p, --production', 'Prod DB action')
  .parse(process.argv)

const options = commander.opts()
const localRunTimeEnv = options.local || false
const prodRunTimeEnv = options.production || false

async function transformCompaniesIndexed() {
  async function getAllCompanies() {
    let allIndexedCompanies
    if (localRunTimeEnv) {
      console.log('local')
      allIndexedCompanies = await Company.findAll({
        where: {
          data_verified: true,
        },
      })
      return allIndexedCompanies
    }

    if (prodRunTimeEnv) {
      // For prod - from local DB dump csv
      const allIndexedCompanies = await csv().fromFile(
        `../../ellen_db_dumps/indexedCompanies_${today}_local.csv`
      )

      return allIndexedCompanies
    }
  }

  let allCompanies = await getAllCompanies()


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
