const csv = require('csvtojson')
const db = require('../server/models/index')
const fs = require('fs')
// const scriptConstants = require('./script_constants')

const AOV_MONTH = '2021-12-01'
const AOV_COMPANY = 'help@goodamerican.com'

async function importCSV() {
  // const csvFilePath = `../../edison_daily_updates/dec_21_test/2021-12-22_000.csv`
  const folderPath = '../../edison_daily_updates/dec_21_test/'
  await db.sequelize.query(
    `TRUNCATE public.edison_receipts_monthly_calcs RESTART IDENTITY`
  ) // clean out old data
  const allFiles = fs.readdirSync(folderPath)

  // Loop through files and ingest them to edison_receipts_monthly_calcs
  // using for..of to ensure promises of bulkCreate are resolved before moving on
  for (file of allFiles) {
    if (file !== '.DS_Store') {
      console.log(file)
      let csvData = await csv().fromFile(`${folderPath}${file}`)
      try {
        await db.edison_receipts_monthly_calc.bulkCreate(csvData)
        console.log(`done importing ${file}`)
      } catch (error) {
        console.error(`could not import ${file}`)
      }
    }
  }
}

async function getAOV(company) {
  const [values] = await db.sequelize.query(
    `SELECT distinct on (checksum) order_subtotal,from_domain,checksum,email_time
    FROM public.edison_receipts_monthly_calcs
	  WHERE email_time >= '${AOV_MONTH}'::date
    AND from_domain = '${company}'
    AND order_subtotal != ''
    AND order_subtotal != '0'`
  )

  const parsedValues = values.map((orderRow) => {
    return parseFloat(orderRow.order_subtotal)
  })

  console.log(parsedValues)

  // get the average of the values
  let aov = parsedValues.reduce((a, b) => a + b, 0) / parsedValues.length
  aov = aov.toFixed(2)
  console.log('starting aov..')

  // commit the AOV for this specific company and time period to the DB
  try {
    const createdRecord = await db.sequelize.query(
      `INSERT INTO public.aov_indexed_companIES (
        "from_domain", "aov_period", "aov_value",
      "createdAt", "updatedAt"
    ) VALUES (
        '${company}', '${AOV_MONTH}', '${aov}',
        NOW(), NOW()
    )`
    )
    console.log(createdRecord)
    return createdRecord
  } catch (err) {
    console.log('could not process', company)
  }
}

// getAOV(AOV_COMPANY)

const Company = require('../server/models').Company
async function calcAllIndexedAOV() {
  // get all companies
  // loop through their emails and do getAOV
  const allIndexedCompanies = await Company.findAll({
    where: {
      data_verified: true,
    },
  })

  const allCompanies = allIndexedCompanies.map((company) => {
    return company.emailIdentifier
  })

  console.log('yerp', allCompanies)
  allCompanies.forEach((company) => {
    console.log('trying to add.. ', company)
    getAOV(company)
  })
}

calcAllIndexedAOV()
