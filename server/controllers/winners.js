const Winner = require('../models').Winner;

module.exports = {
  create(req, res) {
    const reqBody = req.body;
    return Winner
      .create({
          endDate: reqBody.endDate,
          prizeType: reqBody.prizeType,
          prizeValue: reqBody.prizeValue,
          prizePosition: reqBody.prizePosition,
          pointsAtWin: reqBody.pointsAtWin,
          customerId: reqBody.customerId
      })
    },

  list(req, res) {
    return Winner
      .findAll()
  }
};