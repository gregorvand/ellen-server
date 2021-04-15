const Point = require('../../models').Point;
const { Op } = require("sequelize");
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc)
dayjs.extend(timezone)


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
  let date1 = earlierDate.toISOString();

  console.log(date1);
  let date2 = laterDate.toISOString();
  console.log(date2);
  

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