const Order = require('../../models').Order
const { Op } = require('sequelize')
const dayjs = require('dayjs')

async function getOrders(id, lookbackMonths = false) {
  let dateRange = lookbackMonths ? lookbackMonths : 0

  // if a timebound has been supplied, we need to figure what the latest
  // date of an Order we have is
  if (lookbackMonths) {
    const latestDate = await Order.findOne({
      where: {
        companyId: id,
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
      companyId: id,
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
  const formattedStartDate = dayjs(dateStart).toISOString()
  const formattedEndDate = dayjs(dateEnd).toISOString()
  return Order.findAll({
    where: {
      companyId: id,
      orderNumber: {
        [Op.gt]: 1,
      },
      orderDate: {
        [Op.between]: [formattedStartDate, formattedEndDate], // default for all dates
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
