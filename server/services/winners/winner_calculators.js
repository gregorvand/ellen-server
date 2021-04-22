// const Winner = require('../../models').Winner;
const winnersController = require('../../controllers/winners');
const pointsController = require('../../controllers/points');
// const { Op } = require("sequelize");
// const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculateDailyWinners() {
  // need to create a Promise-based function that captures 
  // Get current rankings
  return pointsController.dailyRankedList()
  
  // Insert into Winners DB
  // Return the finally created entries
} 

module.exports.calculateDailyWinners = calculateDailyWinners;