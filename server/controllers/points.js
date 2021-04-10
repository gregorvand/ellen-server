const Point = require('../models').Point;
const { Op } = require("sequelize");

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
    internalUpdate(pointIdentifier, activated) {
      try {
          return Point
            .findByPk(pointIdentifier)
            .then(pointTransaction => {
              if (!pointTransaction) {
                console.error('no points record found');
              }
              return pointTransaction
                .update({
                  activated: activated || false
                })
                .then(console.log(`updated ${pointIdentifier} as ${activated}`))
                .catch(e => console.log(e)); 
            })
        } catch (e) {
          console.error(e);
        }
    },
    internalCreate(pointsValue, customerId, activated, reason, orderIdentifier) {
      // upserts if finds that orderId already with activated status
      console.log('poiiiints', pointsValue)
      if (pointsValue !== '0') {
        try {
          return Point
            .findOne({ where: {
              [Op.and] : [
                  {orderId: orderIdentifier}, {reason: reason}
                ]
              }
            })
            .then((obj) => {
              if (obj) {
                console.log('gotz here');
                this.internalUpdate(obj.id, obj.activated);
              } else {
                return Point.create({
                  pointsValue: pointsValue,
                  customerId: customerId, 
                  orderId: orderIdentifier,
                  activated: activated || false,
                  reason: reason || 1
                }).then(transaction => 
                  console.log(`added points of ${transaction.pointsValue}, activated: ${activated}`)
                )
                .catch(error => console.error(error)); // obscure error message, stop people decoding API
              }
            })
          } catch (error) {
            console.error(error);
          }
      } else {
          console.error('tried to add zero points');
      }
    }
};

// not an external API function (yet)
// ie, validating points can only be done internally
// no req/res returned
async function validatePointsTransaction (orderIdLookup, validate = true, reason = 1) {
    return Point
    .findALl({
      where: {
        orderId: orderIdLookup
      },
    })
    .then(pointsTransaction => {
      try {
        return pointsTransaction.update({
          activated: validate
        }, { plain: true }).then((points) => 
          console.log('updated points transaction', points.id)
        )  
      } catch(e) {
        console.log('could not update points, probably legacy');
      }
    })
    .catch((error) => console.error(error));
}

module.exports.validatePointsTransaction = validatePointsTransaction;