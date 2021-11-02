const DatasetAccess = require('../models').DatasetAccess
const userHelpers = require('../utils/getUserFromToken')

const creditTransactionController = require('../controllers/creditTransaction')

module.exports = {
  create(req, res) {
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
    const dataSetsToPurchase = req.body.datasetIdArray
    const tokenCost = process.env.DATASET_COST_TOKEN * dataSetsToPurchase.length

    // check credit balance
    let creditResult = await creditTransactionController.getCreditBalance(
      currentUser
    )
    const currentBalance = creditResult[0].dataValues.credit_balance
    if (parseInt(currentBalance) - tokenCost >= 0) {
      try {
        await creditTransactionController.create({
          creditValue: -tokenCost,
          activated: true,
          method: 'internal',
          customerId: currentUser.id,
        })
      } catch (e) {
        res.send(400)
      }

      let allPromises = []

      dataSetsToPurchase.forEach((dataSetId) => {
        let thePromise = createDatasetAccess({
          userId: currentUser.id,
          datasetId: dataSetId,
          companyId: req.body.companyId,
        })

        allPromises.push(thePromise)
      })
      await Promise.all(allPromises).then((values) => {
        res.send(values)
      })
    } else {
      console.log('purchase was not possible, likely insufficent funds')
      res.status(433).send('not enough credits')
    }
  },

  // internal
  async getAccessCheck(userId, datasetId) {
    return DatasetAccess.findOne({
      where: { customerId: userId, datasetId: datasetId },
    }).then((result) => result)
  },

  async userAccessByCompany(userId, companyId) {
    return DatasetAccess.findAll({
      where: { customerId: userId, companyId: companyId },
    }).then((result) => result)
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
