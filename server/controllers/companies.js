const Company = require('../models').Company
const aov_indexed_company = require('../models').aov_indexed_company
const IndexedCompany = require('../models').IndexedCompany
const userHelpers = require('../utils/getUserFromToken')

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

  listByCompany(req, res) {
    return Company.findByPk(req.params.companyId)
      .then((company) => res.status(200).send(company))
      .catch((error) => res.status(400).send(error))
  },

  async listByUser(req, res) {
    let selectedCompanies
    const currentUser = await userHelpers.currentUser(req.token)
    try {
      if (process.env.DATA_ENV === 'unverified') {
        selectedCompanies = await currentUser.getCompanies({
          order: [['nameIdentifier', 'ASC']],
        })
      } else {
        selectedCompanies = await currentUser.getIndexedCompanies({
          order: [['nameIdentifier', 'ASC']],
        })
      }
      res.json({
        companies: selectedCompanies,
      })
    } catch (err) {
      res.send(err)
    }
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

  async internalCreate(name, email, company = null) {
    const existingCompany = await Company.count({
      where: { ticker: company?.ticker },
    })

    if (existingCompany == 0) {
      return Company.create({
        nameIdentifier: name,
        emailIdentifier: email || 'n/a',
        orderPrefix: '#',
        orderSuffix: '',
        ticker: company?.ticker,
        companyType: company?.companyType,
        sector: company?.sector,
        industry: company?.industry,
        exchangeShortName: company?.exchangeShortName,
      })
        .then((company) => {
          console.log('create', company.nameIdentifier)
        })
        .catch((error) => res.status(400).send(error))
    } else {
      console.log(`already had ${company.nameIdentifier}`)
    }
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

  async trendingList(req, res) {
    const trendingCompanies = await IndexedCompany.findAll({
      where: {
        highlight: true,
      },
    })
    res.send(trendingCompanies)
  },

  async getUsersFromCompanies(companyTicker) {
    const companyObject = await Company.findOne({
      where: {
        ticker: companyTicker,
      },
    })

    console.log(companyObject.dataValues.ticker)
    const userList = await companyObject.getUsers()
    return userList
  },

  async setCategory(req, res) {
    const company = await Company.findOne({
      where: {
        id: req.body.companyId,
      },
    })

    console.log(company.id)

    company
      .addCompanyCategory(req.body.categoryListingId)
      .then((created) => {
        res.status(201).send(company)
      })
      .catch((err) => {
        res.status(403).send('could not create category', err.code)
        res.end()
      })
  },

  async getIndexedCompany(req, res) {
    let companyDataObject
    if (process.env.DATA_ENV === 'unverified') {
      companyDataObject = Company
    } else {
      companyDataObject = IndexedCompany
    }
    const company = await companyDataObject.findOne({
      where: {
        id: req.query.id,
      },
    })
    res.send(company)
  },

  async getLatestAov(req, res) {
    const currentUser = await userHelpers.currentUser(req.token)
    const DatasetAccess = require('../controllers/datasetAccess')

    console.log(currentUser)

    const accessGranted = await DatasetAccess.userAccessByCompany(
      currentUser.id,
      req.body.from_domain
    )

    // console.log('got here', req)
    if (accessGranted.length > 0) {
      try {
        const companyAov = await aov_indexed_company.findOne({
          where: {
            from_domain: req.body.from_domain,
          },
          attributes: ['aov_period', 'aov_value'],
        })
        console.log(companyAov)
        res.status(200).send(companyAov)
      } catch (err) {
        console.log(err)
      }
    } else {
      res.status(403).send('Access Denied')
    }
  },
}
