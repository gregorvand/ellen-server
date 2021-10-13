const Order = require('../../models').Order

const Company = require('../../models').Company
const { Op } = require('sequelize')
const dayjs = require('dayjs')

async function getOrders(id, lookbackMonths = false) {
  let dateRange = lookbackMonths ? lookbackMonths : 0
  const company = await Company.findOne({ where: { id: id } })

  // if a timebound has been supplied, we need to figure what the latest
  // date of an Order we have is
  if (lookbackMonths) {
    const latestDate = await Order.findOne({
      where: {
        fromEmail: company.emailIdentifier,
        orderNumber: {
          [Op.gt]: 1,
        },
      },
      attributes: ['orderDate'],
      order: [['orderDate', 'DESC']],
    })

    let dateToUse = dayjs(latestDate.orderDate)
    const earlierDate = dateToUse.subtract(lookbackMonths, 'month')
    dateRange = earlierDate.toISOString()
  }

  return Order.findAll({
    where: {
      fromEmail: company.emailIdentifier,
      orderNumber: {
        [Op.gt]: 1,
      },
      orderDate: {
        [Op.gt]: dateRange, // default for all dates
      },
    },
    attributes: [
      ['orderDate', 't'],
      ['orderNumber', 'y'],
    ],
    order: [['orderDate', 'ASC']],
  })
    .then((orders) => orders)
    .catch((error) => console.error('error with company page lookup', error))
}

async function getOrdersByMonth(id, dateStart, dateEnd) {
  const company = await Company.findOne({ where: { id: id } })
  console.log('COMPANY!!', company.nameIdentifier)
  return Order.findAll({
    where: {
      fromEmail: company.emailIdentifier,
      orderNumber: {
        [Op.gt]: 1,
      },
      orderDate: {
        [Op.between]: [dateStart, dateEnd], // default for all dates
      },
    },
    attributes: [
      ['orderDate', 't'],
      ['orderNumber', 'y'],
    ],
    order: [['orderDate', 'ASC']],
  })
    .then((orders) => orders)
    .catch((error) => console.error('error with company page lookup', error))
}

module.exports = {
  getOrders: getOrders,
  getOrdersByMonth: getOrdersByMonth,
}
