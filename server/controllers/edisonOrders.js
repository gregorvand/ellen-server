const EdisonOrder = require('../models').EdisonOrder
const Company = require('../models').Company
const db = require('../models/index')

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

const edisonOrdersUnqiueOrderNumber = async function (req, res) {
  const [results] = await db.sequelize.query(
    `select distinct on ("orderNumber") *
    from public."EdisonOrders"
    where "fromDomain" = '${req.body.companyEmail}' 
    order by "orderNumber", "emailDate"`
  )
  res.send(results).status(200)
}

// pass in company, year
// get the months from that year that have data
// constructed with help via https://stackoverflow.com/questions/69127003/mixing-distinct-with-group-by-postgres
const monthsAvailableByYear = async function (req, res) {
  const company = await Company.findOne({ where: { id: req.body.companyId } })

  const [results] = await db.sequelize.query(
    `SELECT
          DATE_PART('month', "orderDate") AS month,
          COUNT(DISTINCT "orderDate"::date) AS count
      FROM "Orders"
      WHERE
        "fromDomain" = '${company.emailIdentifier}' AND
        "orderNumber" != 1 AND
        DATE_PART('year', "orderDate") = ${req.body.year}
      GROUP BY
        DATE_PART('month', "orderDate")
      HAVING
        COUNT(DISTINCT "orderDate"::date) > 1;`
  )
  res.send(results).status(200)
}

module.exports = {
  insertEdisonRowNoId: insertEdisonRowNoId,
  edisonOrdersUnqiueOrderNumber: edisonOrdersUnqiueOrderNumber,
  monthsAvailableByYear: monthsAvailableByYear,
}
