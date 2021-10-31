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
  // const [results] = await db.sequelize.query(
  //   `select distinct on ("orderNumber") *
  //   from public."EdisonOrders"
  //   where "fromDomain" = '${req.body.companyEmail}'
  //   order by "orderNumber", "emailDate"`
  // )
  // res.send(results).status(200)

  console.log(`${req.body.dateStart.toString()}`)

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

  // and "emailDate" between ${toString(
  //   dayjs(req.body.dateStart).format('YYYY-MM-DD')
  // )} and ${toString(dayjs(req.body.dateEnd).format('YYYY-MM-DD'))}

  // const company = await Company.findOne({ where: { id: req.body.id } })
  // return EdisonOrder.findAll({
  //   where: {
  //     fromDomain: company.emailIdentifier,
  //     orderNumber: {
  //       [Op.regexp]: '^\\d+$',
  //     },
  //     emailDate: {
  //       [Op.between]: [req.body.dateStart, req.body.dateEnd], // default for all dates
  //     },
  //   },
  //   order: ['orderNumber', 'id'],
  //   // order: [['emailDate', 'ASC']],
  // })
  //   .then((orders) => res.send(orders))
  //   .catch((error) => console.error('error with company page lookup', error))
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

module.exports = {
  insertEdisonRowNoId: insertEdisonRowNoId,
  edisonOrdersUniqueOrderNumber: edisonOrdersUniqueOrderNumber,
  monthsAvailableByYear: monthsAvailableByYear,
}