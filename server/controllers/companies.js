const Company = require('../models').Company;
const Order = require('../models').Order;

module.exports = {
  create(req, res) {
    return Company
      .create({
        nameIdentifier: req.body.name,
        emailIdentifier: req.body.email,
        orderPrefix: req.body.prefix || '#',
        orderSuffix: req.body.suffix || '',
      })
      .then(company => res.status(201).send(company))
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return Company
      .findAll({
        include: [{
          model: Order,
          as: 'orders'
        }],
      })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
  },

  listByCompany(req, res) {
    return Company
    .findByPk(req.params.companyId, {
      include: [{
        model: Order,
        as: 'orders',
      }],
    })
      .then((company) => res.status(200).send(company))
      .catch((error) => res.status(400).send(error));
  },

  internalCreate(name, email) {
    return Company
      .create({
        nameIdentifier: name,
        emailIdentifier: email,
        orderPrefix: '#',
        orderSuffix: '',
      })
      .then(company => company)
      .catch(error => res.status(400).send(error));
  },
};