// const Order = require('../../models').Order
const EdisonOrder = require('../../models').EdisonOrder

const Company = require('../../models').Company
const { Op } = require('sequelize')
const db = require('../../models/index')
const dayjs = require('dayjs')

async function getOrders(id, lookbackMonths = false) {
  let dateRange = lookbackMonths ? lookbackMonths : 0
  const company = await Company.findOne({ where: { id: id } })

  // if a timebound has been supplied, we need to figure what the latest
  // date of an Order we have is
  if (lookbackMonths) {
    const latestDate = await EdisonOrder.findOne({
      where: {
        fromDomain: company.emailIdentifier,
        orderNumber: {
          [Op.gt]: 1,
        },
      },
      attributes: ['emailDate'],
      order: [['emailDate', 'DESC']],
    })

    let dateToUse = dayjs(latestDate.emailDate)
    const earlierDate = dateToUse.subtract(lookbackMonths, 'month')
    dateRange = earlierDate.toISOString()
  }

  return EdisonOrder.findAll({
    where: {
      fromDomain: company.emailIdentifier,
      orderNumber: {
        [Op.gt]: 1,
      },
      emailDate: {
        [Op.gt]: dateRange, // default for all dates
      },
    },
    attributes: [
      ['emailDate', 't'],
      ['orderNumber', 'y'],
    ],
    order: [['emailDate', 'ASC']],
  })
    .then((orders) => orders)
    .catch((error) => console.error('error with company page lookup', error))
}

// async function getOrdersByMonth(id, dateStart, dateEnd) {
//   const company = await Company.findOne({ where: { id: id } })
//   console.log('COMPANY!!', company.nameIdentifier)
//   const [results] = await db.sequelize.query(
//     `SELECT
//         DISTINCT ON ("orderNumber") *
//       FROM
//         "EdisonOrders"
//       WHERE
//         "fromDomain" = 'support@fragrantjewels.com'
//         and "orderNumber" ~ '^\\d+$'
//       ORDER BY
//         "orderNumber",
//         "emailDate"`
//   )
//   return results
// }

async function getOrdersByMonth(id, dateStart, dateEnd) {
  const company = await Company.findOne({ where: { id: id } })
  console.log('COMPANY!!', company.nameIdentifier)
  return EdisonOrder.findAll({
    where: {
      fromDomain: company.emailIdentifier,
      orderNumber: {
        [Op.regexp]: '^\\d+$',
      },
      emailDate: {
        [Op.between]: [dateStart, dateEnd], // default for all dates
      },
    },
    attributes: [
      ['emailDate', 't'],
      ['orderNumber', 'y'],
    ],
    order: [['emailDate', 'ASC']],
  })
    .then((orders) => orders)
    .catch((error) => console.error('error with company page lookup', error))
}

module.exports = {
  getOrders: getOrders,
  getOrdersByMonth: getOrdersByMonth,
}
