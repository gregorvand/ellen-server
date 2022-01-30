// `SELECT COUNT (*) as count_all, user_id, from_domain
// FROM public.edison_receipts_monthly_calcs
// WHERE from_domain = 'hello@email.lacolombe.com'
// GROUP BY user_id, from_domain`

const db = require('../server/models/index')
const Company = require('../server/models').Company

async function calcAllAvgOrderTotals() {
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
    await getCountPerCustomer(company)
  }
}

async function getCountPerCustomer(company) {
  const [values] = await db.sequelize.query(
    `SELECT COUNT (*) as count_all, user_id, from_domain
    FROM public.edison_receipts_monthly_calcs
    WHERE from_domain = '${company}'
    GROUP BY user_id, from_domain`
  )

  // get average of all values
  const allCounts = values.map((orderRow) => {
    return parseFloat(orderRow.count_all)
  })

  if (allCounts.length > 5) {
    const act = parseFloat(
      allCounts.reduce((a, b) => a + b, 0) / allCounts.length
    ).toFixed(2)

    console.log(`avg for all customers of ${company}: `, act)

    try {
      const createdRecord = await db.sequelize.query(
        `INSERT INTO public.act_indexed_companies (
          "from_domain", "act_value",
        "createdAt", "updatedAt"
      ) VALUES (
          '${company}', '${act}',
          NOW(), NOW()
      )
      ON CONFLICT ("from_domain")
      DO UPDATE SET
      "act_value"=excluded."act_value";`
      )
    } catch (err) {
      console.log('could not process act for ', company)
    }
  }
}

// getCountPerCustomer('orders@rumpl.com')
calcAllAvgOrderTotals()
