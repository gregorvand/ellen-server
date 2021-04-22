const Point = require('../../models').Point;
const { Op } = require("sequelize");
const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculatePointsFromReason(userId, pointsReason) {
  return Point.findAndCountAll({
    where: {
      [Op.and] : [
        {customerId: userId}, {reason: pointsReason}, {activated: true}
      ]
    }
  })
  .then((countedTransactions) => {
    return countedTransactions.count;
  })
}

async function calculateAllPoints(userId) {
  return Point.sum('pointsValue', {
    where: {
      [Op.and] : [
        {customerId: userId}, {activated: true}
      ]
    }
  })
  .then((allTransactions) => {
    return allTransactions;
  })
}

async function calculateAllPointsWithTimeframe(userId, earlierDate, laterDate) {
  date1 = earlierDate;
  date2 = laterDate;

  try {
    if (date1 && date2 !== undefined) {
      return Point.sum('pointsValue', {
        where: {
          [Op.and] : [
            {customerId: userId}, {activated: true},
            {
              createdAt: {[Op.between] : [date1 , date2]}
            }
          ],
        },
      })
      .then((allTransactions) => {
        return allTransactions ? allTransactions : 0; // sequelize returns NaN from sum if zero
      })
    } else {
      throw new Error('No date defined, cannot calculate');
    }
  } catch(e) {
    console.error(e);
  }
}


module.exports.calculatePointsFromReason = calculatePointsFromReason;
module.exports.calculateAllPointsWithTimeframe = calculateAllPointsWithTimeframe;
module.exports.calculateAllPoints = calculateAllPoints;