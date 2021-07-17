const Point = require('../../models').Point
const { Op } = require('sequelize')
const Today = require('../../utils/getToday')

// calculates the count of Point transactions for a given Point.reason
async function calculatePointsFromReason(userId, pointsReason) {
  return Point.findAndCountAll({
    where: {
      [Op.and]: [
        { customerId: userId },
        { reason: pointsReason },
        { activated: true },
      ],
    },
  }).then((countedTransactions) => {
    return countedTransactions.count
  })
}

async function calculateAllPoints(userId) {
  return Point.sum('pointsValue', {
    where: {
      [Op.and]: [{ customerId: userId }, { activated: true }],
    },
  }).then((allTransactions) => {
    return allTransactions ? allTransactions : 0
  })
}

module.exports.calculatePointsFromReason = calculatePointsFromReason
module.exports.calculateAllPoints = calculateAllPoints
