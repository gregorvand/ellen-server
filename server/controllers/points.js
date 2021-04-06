const Point = require('../models').Point;

module.exports = {
  create(req, res) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    if (req.body.pointsValue !== '0') {
      try {
        return Point
          .create({
            pointsValue: req.body.pointsValue || 0,
            customerId: req.body.customerId || 0
          })
          .then(company => res.status(201).send(company))
          .catch(error => res.status(400).send('not possible!')); // obscure error message, stop people decoding API
        } catch (e) {
          throw new error(e);
        }
      } else {
        res.status(400).send('points submitted must be greater than zero');
      }
    }
};