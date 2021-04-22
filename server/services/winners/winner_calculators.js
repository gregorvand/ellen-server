// const Winner = require('../../models').Winner;
const winnersController = require('../../controllers/winners');
const pointsController = require('../../controllers/points');
const constants = require('../../utils/constants');
// const { Op } = require("sequelize");
// const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculateDailyWinners(endDate) {
  // need to create a Promise-based function that captures 
  // Get current rankings
  pointsController.dailyRankedList(endDate)
    .then((results) => {

      // map main aggregated data
      const records = results.map(result => result.dataValues);
      records.forEach((result, index) => {
        // get userInfo into nicer object
        const userInfo = result.User.dataValues;
        // lookup prizeValue from 'ranking' here
        // results come in DESC order so 1st prize = first result
        const ranking = index +1;
        const prize = constants.DAILY_PRIZES[ranking-1]['value'];

        // set up req object with all values and create record in Winner table
        let req = [];
        req['body'] = {
          'endDate': endDate,
          'prizeType': 'daily',
          'prizeValue': prize,
          'prizePosition': ranking,
          'pointsAtWin': result.total,
          'customerId': userInfo.id
        }
        winnersController.create(req);
      })
    });
  
  // Insert into Winners DB
  // Return the finally created entries
} 

module.exports.calculateDailyWinners = calculateDailyWinners;