const DatasetAccess = require('../models').DatasetAccess
const userHelpers = require('../utils/getUserFromToken')

const creditTransactionController = require('../controllers/creditTransaction')

module.exports = {
  create(req, res) {
    console.log(req.body)
    try {
      createDatasetAccess(req.body)
        .then((dataAcess) => res.status(201).send(dataAcess))
        .catch((error) =>
          res.status(400).send(`could not add access due to ${error}`)
        ) // obscure error message, stop people decoding API
    } catch (e) {
      throw new error(e)
    }
  },

  async getUserAccessListByCompany(req, res) {
    const currentUser = await userHelpers.currentUser(req.token)
    try {
      return DatasetAccess.findAll({
        where: { companyId: req.query.companyId, customerId: currentUser.id },
      })
        .then((dataAccess) => res.send(dataAccess))
        .catch((error) =>
          res.status(400).send(`could not find access due to ${error}`)
        ) // obscure error message, stop people decoding API
    } catch (e) {
      throw new error(e)
    }
  },

  async datasetAccessCharge(req, res) {
    const currentUser = await userHelpers.currentUser(req.token)
    const tokenCost = process.env.DATASET_COST_TOKEN
    console.log(req.body)

    // check credit balance
    let creditResult = await creditTransactionController.getCreditBalance(
      currentUser
    )
    const currentBalance = creditResult[0].dataValues.credit_balance
    if (parseInt(currentBalance) - tokenCost >= 0) {
      console.log('great! proceed!')

      try {
        await creditTransactionController.create({
          creditValue: -tokenCost,
          activated: true,
          method: 'internal',
          customerId: currentUser.id,
        })
      } catch (e) {
        console.log('darn, issue with charging')
        res.send(400)
      }

      createDatasetAccess({
        userId: currentUser.id,
        datasetId: req.body.datasetId,
        companyId: req.body.companyId,
      }).then((result) => {
        res.send(result)
      })
    } else {
      console.log('purchase was not possible, likely insufficent funds')
      res.status(433).send('not enough credits')
    }

    // if ok update with new record

    // return success
  },
}

async function createDatasetAccess(accessProperties) {
  const { userId, datasetId, expiry, companyId } = accessProperties
  return DatasetAccess.create({
    datasetId: datasetId,
    customerId: userId,
    expiry: expiry || new Date(),
    companyId: companyId,
  })
}
