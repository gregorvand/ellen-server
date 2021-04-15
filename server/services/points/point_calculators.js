const Point = require('../../models').Point;
const { Op } = require("sequelize");

// calculates the count of Point transactions for a given Point.reason
async function calculatePointsFromReason(userId, pointsReason) {
  return Point.findAndCountAll({
    where: {
      [Op.and] : [
        {customerId: userId}, {reason: pointsReason}
      ]
    }
  })
  .then((countedTransactions) => {
    return countedTransactions.count;
  })
}

module.exports.calculatePointsFromReason = calculatePointsFromReason;