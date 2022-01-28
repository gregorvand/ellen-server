const csv = require('csvtojson')
const db = require('../server/models/index')
const fs = require('fs')
// const scriptConstants = require('./script_constants')

// --------
// SET MONTH FOR INGEST AND AOV CALCULATION
const AOV_MONTH = 12
// --------

// Designed to import a full (ie not already de-duplicated) set of order data from a given month
// This is designed to be run once per month
// The getAOV function selects disctinct (for e.g.) handle this
async function importCSVs() {
  // const csvFilePath = `../../edison_daily_updates/dec_21_test/2021-12-22_000.csv`
  const folderPath = `../../edison_daily_updates/${AOV_MONTH}-21/`
  // await db.sequelize.query(
  //   `TRUNCATE public.edison_receipts_monthly_calcs RESTART IDENTITY`
  // ) // clean out old data
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

// PERIOD TO CALCULATE AOV FOR

async function getAOV(company, months = [10, 11, 12]) {
  for (aMonth of months) {
    console.log('trying to add.. ', company, aMonth)
    const AOV_START = `2021-${aMonth}-01`
    const AOV_END = `2021-${aMonth}-30` // 31 or 30 depending on month

    const [values] = await db.sequelize.query(
      `SELECT distinct on (checksum) order_subtotal,from_domain,checksum,email_time
      FROM public.edison_receipts_monthly_calcs
      WHERE email_time >= '${AOV_START}'::date
      AND email_time <= '${AOV_END}'::date
      AND from_domain = '${company}'
      AND order_subtotal != ''
      AND order_subtotal != '0'`
    )

    const parsedValues = values.map((orderRow) => {
      return parseFloat(orderRow.order_subtotal)
    })

    console.log('how many', parsedValues.length)

    // Ensure we have enough orders for an accurate AOV
    if (parsedValues.length > 5) {
      const removeZeroValues = parsedValues.filter((value) => {
        return value != 0
      })

      console.log(removeZeroValues)

      // get the average of the values
      let aov =
        removeZeroValues.reduce((a, b) => a + b, 0) / removeZeroValues.length
      aov = aov.toFixed(2)
      console.log('calc aov..', aov)

      // commit the AOV for this specific company and time period to the DB
      if (aov !== 'NaN') {
        try {
          await db.sequelize.query(
            `INSERT INTO public.aov_indexed_companies (
              "from_domain", "aov_period", "aov_value",
            "createdAt", "updatedAt"
          ) VALUES (
              '${company}', '${AOV_END}', '${aov}',
              NOW(), NOW()
          )`
          )
        } catch (err) {
          console.log('could not process', company)
        }
      }
    }
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

  allCompanies.forEach((company) => {
    console.log('trying to add.. ', company)
    getAOV(company)
  })
}

// Check one company
// const AOV_COMPANY = 'pepsquad@wearpepper.com'
// getAOV(AOV_COMPANY, [10, 11, 12])

// Import a set of CSV files from a folder
// importCSVs()

// Use all ingested CSVs and get a specific month's AOV data
// NOTE set variables above before running
calcAllIndexedAOV()
