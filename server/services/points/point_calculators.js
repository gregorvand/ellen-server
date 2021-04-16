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
  const date1 = dateObjects.startOfYesterdayBySetTimezone;
  const date2 = dateObjects.endofTodayBySetTimezone;
  console.log(`start ${date1} end ${date2}`);
  
  return Point.sum('pointsValue', {
    where: {
      [Op.and] : [
        {customerId: userId}, {activated: true},
        {
          createdAt: {
            [Op.lt]: date2,
            [Op.gte]: date1 // ie from midnight of earlier date, to 11.59 of the current date
          }
        }
      ],
    },
  })
  .then((allTransactions) => {
    return allTransactions;
  })
}


module.exports.calculatePointsFromReason = calculatePointsFromReason;
module.exports.calculateAllPointsWithTimeframe = calculateAllPointsWithTimeframe;
module.exports.calculateAllPoints = calculateAllPoints;