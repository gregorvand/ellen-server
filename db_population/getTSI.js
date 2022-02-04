// Gets the top selling items (tsi) per company, and adds them to the DB

const db = require('../server/models/index')
const Company = require('../server/models').Company

async function retrieveAllTopItems() {
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
    await getCountPerItem(company)
  }
}

// get the top 3 items per company
async function getCountPerItem(company) {
  const [values] = await db.sequelize.query(
    `SELECT COUNT (item_description) as item_count, item_description
    FROM public.edison_receipts_monthly_calcs
    WHERE from_domain = '${company}'
    GROUP BY item_description
    ORDER BY item_count DESC
    LIMIT 3`
  )

  // so long as the count is more than 1, consider it for adding to the DB
  for (item of values) {
    if (item.item_count > 30) {
      console.log(`${item.item_description} : ${item.item_count}`)

      // if same item/company combo exists, update the count
      try {
        await db.sequelize.query(
          `INSERT INTO public.tsi_indexed_companies (
            "from_domain", "item_description", "item_count",
          "createdAt", "updatedAt"
        ) VALUES (
            '${company}', '${item.item_description}', '${item.item_count}',
            NOW(), NOW()
        )
        ON CONFLICT ("from_domain", "item_description")
        DO UPDATE SET
        "item_count"=excluded."item_count";`
        )
      } catch (err) {
        console.log('could not process tsi for ', company)
      }
    }
  }
}

// getCountPerCustomer('orders@rumpl.com')
retrieveAllTopItems()
