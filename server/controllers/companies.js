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
    console.log('gots here');
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

  update(req, res) {
    return Company
      .findByPk(req.params.id)
      .then(company => {
        if (!company) {
          return res.status(404).send({
            message: 'Company Not Found',
          });
        }
        return company
          .update({
            nameIdentifier: req.body.nameIdentifier || 'newname',
          })
          .then(() => res.status(200).send(company))  // Send back the updated todo.
          .catch((error) => res.status(400).send(error));
      })
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

  internalList(req, res) {
    return Company
      .findAll({ order: [
        ['nameIdentifier', 'ASC'],
      ]})
      .then(companies => companies)
      .catch((error) => res.status(400).send(error))
  }
};