const Point = require('../models').Point
const User = require('../models').User
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const Today = require('../utils/getToday')

module.exports = {
  create(req, res) {
    if (req.body.pointsValue !== '0') {
      try {
        return Point.create({
          pointsValue: req.body.pointsValue || 0,
          customerId: req.body.customerId || 0,
        })
          .then((transaction) => res.status(201).send(transaction))
          .catch((error) => res.status(400).send('not possible!')) // obscure error message, stop people decoding API
      } catch (e) {
        throw new error(e)
      }
    } else {
      res.status(400).send('points submitted must be greater than zero')
    }
  },
  internalCreate(pointsValue, customerId, activated, reason, orderIdentifier) {
    if (pointsValue !== '0') {
      try {
        return Point.create({
          pointsValue: pointsValue,
          customerId: customerId,
          emailId: orderIdentifier,
          activated: activated || false,
          reason: reason || 1,
        })
          .then((transaction) =>
            console.log(
              `added points of, ${transaction.pointsValue}, activated: ${activated}`
            )
          )
          .catch((error) => console.error(error)) // obscure error message, stop people decoding API
      } catch (e) {
        throw new error(e)
      }
    } else {
      console.error('tried to add zero points')
    }
  },
  internalUpdate(pointIdentifier, activated) {
    try {
      return Point.findByPk(pointIdentifier).then((pointTransaction) => {
        if (!pointTransaction) {
          console.error('no points record found')
        }
        return pointTransaction
          .update({
            activated: activated || false,
          })
          .then(console.log(`updated ${pointIdentifier} as ${activated}`))
          .catch((e) => console.log(e))
      })
    } catch (e) {
      console.error(e)
    }
  },
  upsert(pointsValue, customerId, activated, reason, orderIdentifier) {
    // upserts if finds that orderId already with activated status
    if (pointsValue !== '0') {
      try {
        return Point.findOne({
          where: {
            [Op.and]: [{ emailId: orderIdentifier }, { reason: reason }],
          },
        }).then((obj) => {
          if (obj) {
            this.internalUpdate(obj.id, obj.activated)
          } else {
            return Point.create({
              pointsValue: pointsValue,
              customerId: customerId,
              emailId: orderIdentifier,
              activated: activated || false,
              reason: reason || 1,
            })
              .then((transaction) =>
                console.log(
                  `added points of ${transaction.pointsValue}, activated: ${activated}`
                )
              )
              .catch((error) => console.error(error)) // obscure error message, stop people decoding API
          }
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      console.error('tried to add zero points')
    }
  },

  dailyRankedList(startTime, endTime) {
    // find all points in by a specific day
    // summed by user
    // returned in order of most first
    const today = new Date()
    date1 = startTime || new Today(today).startOfToday()
    date2 = endTime || new Today(today).endOfToday()

    return Point.findAll({
      where: { createdAt: { [Op.between]: [date1, date2] } },
      attributes: [
        'customerId',
        [sequelize.fn('sum', sequelize.col('pointsValue')), 'total'],
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      group: ['User.id', 'Point.customerId'],
      order: [[sequelize.fn('sum', sequelize.col('pointsValue')), 'DESC']],
    })
  },

  listByOrder(req, res) {
    return Point.findAll({
      where: {
        [Op.and]: [
          { customerId: req.body.userId },
          { emailId: req.body.emailId },
        ],
      },
    })
  },

  returnDailyPointsByUser(req, res) {
    let today = new Date()
    const date1 = new Today(today).startOfToday()
    const date2 = new Today(today).endOfToday()

    return Point.findAll({
      where: {
        [Op.and]: [
          { customerId: req.body.userId },
          { activated: true },
          { createdAt: { [Op.between]: [date1, date2] } },
        ],
      },
      attributes: [
        [
          sequelize.fn('SUM', sequelize.col('Point.pointsValue')),
          'totalDailyPoints',
        ],
      ],
    })
  },
}

// not an external API function (yet)
// ie, validating points can only be done internally
// no req/res returned
async function validateAllPointsTransactionsForOrder(
  orderIdLookup,
  validate = true
) {
  return Point.findAll({
    where: {
      emailId: orderIdLookup,
    },
  }).then((pointsTransactions) => {
    pointsTransactions.forEach((resultSetItem) => {
      resultSetItem
        .update({
          activated: validate,
        })
        .then((points) => console.log('updated points transaction', points.id))
    })
  })
}

module.exports.validateAllPointsTransactionsForOrder =
  validateAllPointsTransactionsForOrder
