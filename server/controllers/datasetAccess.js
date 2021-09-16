const DatasetAccess = require('../models').DatasetAccess
const User = require('../models').User

module.exports = {
  create(req, res) {
    console.log(req.body)
    const { userId, datasetId, expiry, companyId } = req.body
    try {
      return DatasetAccess.create({
        datasetId: datasetId,
        customerId: userId,
        expiry: expiry || new Date(),
        companyId: companyId,
      })
        .then((dataAcess) => res.status(201).send(dataAcess))
        .catch((error) =>
          res.status(400).send(`could not add access due to ${error}`)
        ) // obscure error message, stop people decoding API
    } catch (e) {
      throw new error(e)
    }
  },

  getUserAccessListByCompany(req, res) {
    console.log(req.query)
    try {
      return DatasetAccess.findAll({
        where: { companyId: req.query.companyId, customerId: req.query.userId },
      })
        .then((dataAccess) => res.send(dataAccess))
        .catch((error) =>
          res.status(400).send(`could not find access due to ${error}`)
        ) // obscure error message, stop people decoding API
    } catch (e) {
      throw new error(e)
    }
  },
}
