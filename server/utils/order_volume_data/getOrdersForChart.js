const Order = require('../../models').Order
const { Op } = require('sequelize')

async function getOrders(id, dates = false) {
  let dateRange = dates ? dates : 0
  console.log(dateRange)
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

module.exports = {
  getOrders: getOrders,
}
