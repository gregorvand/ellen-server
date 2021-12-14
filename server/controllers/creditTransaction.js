const CreditTransaction = require('../models').CreditTransaction
const userHelpers = require('../utils/getUserFromToken')
// const { Op } = require('sequelize')
const sequelize = require('sequelize')

module.exports = {
  // create should be internal only, not yet accessible by endpoint
  create(transaction) {
    const { creditValue, activated, method, customerId, emailIdentifier } =
      transaction
    return CreditTransaction.create({
      value: creditValue,
      activated: activated,
      method: method,
      customerId: customerId,
      emailIdentifier: emailIdentifier,
    })
      .then((res) => {
        console.log('credit success', res)
      })
      .catch((err) => {
        console.error('oh no', err)
      })
  },

  async getTotal(req, res) {
    const currentUser = await userHelpers.currentUser(req.token)
    getCreditBalance(currentUser).then((balance) =>
      res.status(200).send(balance)
    )
  },

  async listTransactions(req, res) {
    const attributes = ['id', 'value', 'activated', 'method']
    const currentUser = await userHelpers.currentUser(req.token)
    const transactions = await CreditTransaction.findAll({
      where: {
        customerId: currentUser.id,
        activated: true,
      },
      attributes: {
        exclude: ['customerId', 'activated', 'updatedAt'],
      },
      limit: 20,
      order: [['createdAt', 'DESC']],
    })
    try {
      res.status(200).send(transactions)
    } catch (err) {
      res.status(500).send(err)
    }
  },
}

async function getCreditBalance(currentUser) {
  return CreditTransaction.findAll({
    where: { customerId: currentUser.id },
    attributes: [
      [sequelize.fn('sum', sequelize.col('value')), 'credit_balance'],
    ],
    group: ['customerId'],
  })
}

module.exports.getCreditBalance = getCreditBalance
