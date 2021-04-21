const Winner = require('../../models').Winner;
// const { Op } = require("sequelize");
// const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculateDailyWinners(date) {
  const dailyWinners = await dailyRankedList();
  console.log('yo');

  dailyWinners.then((winners => {
    console.log(winners);
  }));  
}

module.exports.calculateDailyWinners = calculateDailyWinners;