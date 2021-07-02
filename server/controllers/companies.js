const Company = require('../models').Company
const Order = require('../models').Order
const User = require('../models').User
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

module.exports = {
  create(req, res) {
    return Company.create({
      nameIdentifier: req.body.name,
      emailIdentifier: req.body.email,
      orderPrefix: req.body.prefix || '#',
      orderSuffix: req.body.suffix || '',
    })
      .then((company) => res.status(201).send(company))
      .catch((error) => res.status(400).send(error))
  },

  list(req, res) {
    console.log('gots here')
    return Company.findAll({
      include: [
        {
          model: Order,
          as: 'orders',
        },
      ],
    })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error))
  },

  listByCompany(req, res) {
    return Company.findByPk(req.params.companyId, {
      include: [
        {
          model: Order,
          as: 'orders',
        },
      ],
    })
      .then((company) => res.status(200).send(company))
      .catch((error) => res.status(400).send(error))
  },

  listByUser(req, res) {
    console.log('also yep')
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        console.log('DID GET HERE', req.headers['user'])
        User.findOne({
          where: { email: req.headers['user'] },
        }).then((user) => {
          user.getCompanies().then((selectedCompanies) => {
            res.json({
              companies: selectedCompanies,
            })
          })
        })
      }
    })
  },

  update(req, res) {
    return Company.findByPk(req.params.id)
      .then((company) => {
        if (!company) {
          return res.status(404).send({
            message: 'Company Not Found',
          })
        }
        return company
          .update({
            nameIdentifier: req.body.nameIdentifier || 'newname',
          })
          .then(() => res.status(200).send(company)) // Send back the updated todo.
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  internalCreate(name, email, company = null) {
    return Company.create({
      nameIdentifier: name,
      emailIdentifier: email,
      orderPrefix: '#',
      orderSuffix: '',
      ticker: company?.ticker,
      companyType: company?.companyType,
    })
      .then((company) => {
        console.log('create', company.ticker)
        return company
      })
      .catch((error) => res.status(400).send(error))
  },

  internalList(req, res) {
    return Company.findAll({ order: [['nameIdentifier', 'ASC']] })
      .then((companies) => companies)
      .catch((error) => res.status(400).send(error))
  },

  getCompaniesFromTickers(tickers = []) {
    console.log(tickers)
    return Company.findAll({
      where: {
        ticker: tickers,
      },
    })
  },

  getUsersFromCompanies(companyId) {
    Company.findOne({
      where: {
        id: companyId,
      },
    }).then((companyObject) => {
      companyObject.getUsers().then((UsersToEmail) => console.log(UsersToEmail))
    })
  },
}
