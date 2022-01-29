const db = require('../server/models/index')
// const scriptConstants = require('./script_constants')

// --------
// SET MONTH FOR INGEST AND AOV CALCULATION
const AOV_MONTH = 12
// --------

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

  for (company of allCompanies) {
    console.log('trying to add.. ', company)
    await getAOV(company)
  }
}

// Check one company
// const AOV_COMPANY = 'support@coppercowcoffee.com'
// getAOV(AOV_COMPANY, [10, 11, 12])

// Use all ingested CSVs and get a specific month's AOV data
// NOTE set variables above before running
calcAllIndexedAOV()
