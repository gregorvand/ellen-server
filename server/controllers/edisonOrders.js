// Controller related to the EdisonOrder model
// currently we also have 'ordersByEdison' controller which was for Order model

const EdisonOrder = require('../models').EdisonOrder
const Company = require('../models').Company
const db = require('../models/index')
const { Op } = require('sequelize')

const insertEdisonRowNoId = async function (...edisonRow) {
  const edisonData = edisonRow[0]

  const {
    user_id,
    order_number,
    email_time,
    checksum,
    item_reseller,
    from_domain,
    email_subject,
  } = edisonData
  try {
    return await EdisonOrder.create({
      userId: user_id,
      orderNumber: order_number,
      emailDate: email_time,
      fromDomain: from_domain,
      itemReseller: item_reseller,
      checksum: checksum,
      subjectLine: email_subject,
    })
  } catch (e) {
    console.log(`${e} could not add row ${order_number}`)
  }
}

const edisonOrdersUniqueOrderNumber = async function (req, res) {
  const [results] = await db.sequelize.query(
    `select distinct on ("orderNumber")
    "orderNumber" "y",
    "emailDate" "t"
    from public."EdisonOrders"
    where "fromDomain" = '${req.body.companyEmail}'
    and "orderNumber" ~ '^\\d+$'
    and "emailDate" between '${req.body.dateStart}'::timestamp and '${req.body.dateEnd}'::timestamp
    order by "orderNumber", "emailDate"`
  )
  res.send(results).status(200)
}

// pass in company, year
// get the months from that year that have data
// constructed with help via https://stackoverflow.com/questions/69127003/mixing-distinct-with-group-by-postgres
const monthsAvailableByYear = async function (req, res) {
  const company = await Company.findOne({ where: { id: req.body.companyId } })
  console.log(company.emailIdentifier)
  const [results] = await db.sequelize.query(
    `SELECT
        DATE_PART('month', "emailDate") AS month,
        COUNT(DISTINCT "emailDate"::date) AS count
    FROM "EdisonOrders"
    WHERE
      "orderNumber" ~ '^\\d+$' AND
      "fromDomain" = '${company.emailIdentifier}' AND
      DATE_PART('year', "emailDate") = '${req.body.year}'
    GROUP BY
      DATE_PART('month', "emailDate")
    HAVING
      COUNT(DISTINCT DATE_PART('day', "emailDate")) > 2;`
  )
  res.send(results).status(200)
}

const userHelpers = require('../utils/getUserFromToken')
const DatasetAccess = require('../controllers/datasetAccess')

const edisonOrdersByYear = async function (req, res) {
  console.log(req.body)
  const [results] = await db.sequelize.query(
    `select
    distinct on ("orderNumber") "orderNumber" "y",
    "emailDate" "t"
  from
    public."EdisonOrders"
  where
    EXTRACT(YEAR FROM "emailDate") = ${req.body.year}
    and "fromDomain" = '${req.body.companyEmail}'
  order by
    "orderNumber" asc,
    "emailDate"`
  )

  // which months does user have access to for this company?
  const currentUser = await userHelpers.currentUser(req.token)
  console.log(currentUser.id)

  const accessGranted = await DatasetAccess.userAccessByCompany(
    currentUser.id,
    req.body.companyId
  )

  // allMonths is an array of just which dataset access IDs they have
  // for a given company and requested year
  let allMonths = accessGranted
    .filter((access) => {
      const id = access.dataValues.datasetId
      let year = id.slice(-4)
      if (year == req.body.year) return id
    })
    .map((filtered) => filtered.datasetId)

  let monthsToOpen = allMonths.map((dataset) => {
    return dataset.substr(-8).substring(0, 2)
  })

  console.log(monthsToOpen)

  const regex = `^\\d+$`
  let resultsRegex = results.filter((result) => {
    return result.y.match(regex)
  })

  let matchResultsWithAccess = resultsRegex.filter((result) => {
    const date = new Date(result.t)
    const month = date.getMonth()
    return monthsToOpen.find((access) => access == month)
  })

  res.send(matchResultsWithAccess).status(200)
}

module.exports = {
  insertEdisonRowNoId: insertEdisonRowNoId,
  edisonOrdersUniqueOrderNumber: edisonOrdersUniqueOrderNumber,
  monthsAvailableByYear: monthsAvailableByYear,
  edisonOrdersByYear: edisonOrdersByYear,
}
