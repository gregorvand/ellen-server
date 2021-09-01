const CreditTransaction = require('../models').CreditTransaction
// const { Op } = require('sequelize')
// const sequelize = require('sequelize')

module.exports = {
  // create should be internal only, not yet accessible by endpoint
  create(transaction) {
    const { creditValue, activated, method, customerId } = transaction
    return CreditTransaction.create({
      value: creditValue,
      activated: activated,
      method: method,
      customerId: customerId,
    })
      .then((res) => {
        console.log('credit success', res)
      })
      .catch((err) => {
        console.error('oh no', err)
      })
  },
}
