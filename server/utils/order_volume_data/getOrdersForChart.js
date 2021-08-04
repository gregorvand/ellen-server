const Order = require('../../models').Order
const { Op } = require('sequelize')

async function getOrders(id) {
  return Order.findAll({
    where: {
      companyId: id,
      orderNumber: {
        [Op.gt]: 1,
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
