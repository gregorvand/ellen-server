const CompanyCategory = require('../models').CompanyCategory
const Company = require('../models').Company

const create = async function (req, res) {
  return CompanyCategory.create({
    name: req.body.name,
    metaData: req.body.metaData || [],
  })
    .then((category) => res.status(201).send(category))
    .catch((error) => res.status(400).send(error))
}

const list = async function (req, res) {
  const list = await CompanyCategory.findAll({
    include: [
      {
        model: Company,
        attributes: {
          exclude: [
            // no need to return all data when not required
            'createdAt',
            'updatedAt',
            'emailIdentifier',
            'orderPrefix',
            'orderSuffix',
          ],
        },
      },
    ],
  })
    .then((categorylist) => res.status(201).send(categorylist))
    .catch((error) => res.status(400).send(error))
}

module.exports = {
  create: create,
  list: list,
}
