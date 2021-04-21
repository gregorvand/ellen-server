// const Winner = require('../../models').Winner;
const winnersController = require('../../controllers/winners');
// const { Op } = require("sequelize");
// const dateObjects = require('../../utils/setTimezone');

// calculates the count of Point transactions for a given Point.reason
async function calculateDailyWinners() {
  return winnersController.list();

  // need to create a Promise-based function that captures 
  // Get current rankings
  // Get user info for those rankings
  // Insert into Winners DB
  // Return the finally created entries
} 

module.exports.calculateDailyWinners = calculateDailyWinners;