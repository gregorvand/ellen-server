// const Winner = require('../../models').Winner;
const winnersController = require('../../controllers/winners');
const pointsController = require('../../controllers/points');
const constants = require('../../utils/constants');
// const { Op } = require("sequelize");
const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculateDailyWinners(req, res) {
  // need to create a Promise-based function that captures 
  // Get current rankings
  const endDate = req.body.endDate;
  const convertedEndDate = dateObjects.dayJs(endDate).tz().toISOString();
  const startDateDefault = dateObjects.dayJs(endDate).tz().add('-24', 'hours').toISOString();

  pointsController.dailyRankedList(startDateDefault, convertedEndDate)
    .then((results) => {
      // map main aggregated data
      const records = results.map(result => result.dataValues);
      console.log('LENGTH', records.length);

      // loop of promises. return after all resolved;

      let promises = [];
      for (let i = 0; i < records.length; i++) {
        promises.push(new Promise((resolve, reject) => {
          const userInfo = records[i].User.dataValues;
          console.log(userInfo);
          // lookup prizeValue from 'ranking' here
          // results come in DESC order so 1st prize = first result
          const ranking = i + 1;
          const prize = constants.DAILY_PRIZES[ranking-1]['value'];
          
          // set up req object with all values and create record in Winner table
          let req = [];
          req['body'] = {
            'endDate': endDate,
            'prizeType': 'daily',
            'prizeValue': prize,
            'prizePosition': ranking,
            'pointsAtWin': records[i].total,
            'customerId': userInfo.id
          }
          winnersController.create(req)
            .then((response) => {
              console.log('completed!', response);
              resolve(response)
            }, (response) => {
              console.log(response)
            })
          })
        )
      }
      // Return all records after successful DB update
      Promise.all(promises)
      .then(() => {
        res.status(200).send(records);
      })
      .catch((e) => { res.status(400).send(e) });
    })
  
  // Insert into Winners DB
  // Return the finally created entries
} 

module.exports.calculateDailyWinners = calculateDailyWinners;