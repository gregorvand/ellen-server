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
          .then(transaction => res.status(201).send(transaction))
          .catch(error => res.status(400).send('not possible!')); // obscure error message, stop people decoding API
        } catch (e) {
          throw new error(e);
        }
      } else {
        res.status(400).send('points submitted must be greater than zero');
      }
    },
    internalCreate(pointsValue, customerId, activated, reason, orderIdentifier) {
      if (pointsValue !== '0') {
        try {
          return Point
            .create({
              pointsValue: pointsValue,
              customerId: customerId,
              orderId: orderIdentifier,
              activated: activated || false,
              reason: reason || 1
            })
            .then(transaction => console.log('added points of ', transaction.pointsValue))
            .catch(error => console.error(error)); // obscure error message, stop people decoding API
          } catch (e) {
            throw new error(e);
          }
        } else {
          console.error('tried to add zero points');
        }
      }
};