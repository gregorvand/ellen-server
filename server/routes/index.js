// const todosController = require('../controllers/todos');
// const todoItemsController = require('../controllers/todoitems');
const companiesController = require('../controllers/companies')
const earningsController = require('../controllers/earnings')
const earningCalendarController = require('../controllers/earningCalendar')
const companyCategoryController = require('../controllers/companyCategory')
const datasetAccessController = require('../controllers/datasetAccess')
const ordersController = require('../controllers/orders')
const edisonController = require('../controllers/edisonOrders')
const indexedEdisonController = require('../controllers/indexedEdisonOrders')
const usersController = require('../controllers/users')
const creditTransactionController = require('../controllers/creditTransaction')
const pointsController = require('../controllers/points')
const winnersController = require('../controllers/winners')
const serviceKlaviyo = require('../services/third_party/klaviyo')
const serviceWinners = require('../services/winners/winner_calculators')
const emailHelpers = require('../modules/emailHelpers')
const auth = require('../middleware/getToken')

module.exports = (app) => {
  // examples
  // app.post('/api/todos/:todoId/items', todoItemsController.create);
  // app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.update);
  // app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.destroy);

  // direct/testing api paths

  app.post('/api/companies', companiesController.create)
  app.get('/api/companies/:companyId', companiesController.listByCompany)
  app.post(
    '/api/companies/orders-by-month',
    auth.getToken,
    ordersController.companyDataByMonth
  )

  app.post('/api/orders', ordersController.create)

  // Below endpoint deprecated?
  // app.post('/api/companies/orders', ordersController.listByCompany)

  app.post('/api/points', pointsController.create)
  app.get('/api/points', function (req, res) {
    pointsController
      .listByOrder(req, res)
      .then((transaction) => res.status(200).send(transaction))
      .catch((error) => res.status(400).send('not possible!'))
  })

  app.get('/api/points/rankings/daily', function (req, res) {
    pointsController
      .dailyRankedList(req, res)
      .then((rankedUsers) => {
        console.log(rankedUsers)
        res.send(rankedUsers)
      })
      .catch((e) => {
        res.send(e)
      })
  })

  app.put('/api/points/daily/user', function (req, res) {
    pointsController
      .returnDailyPointsByUser(req, res)
      .then((points) => {
        res.status(200).send(points)
      })
      .catch((e) => {
        res.send(e)
      })
  })

  app.post('/api/winners', function (req, res) {
    winnersController
      .create(req, res)
      .then((winnerDetails) => {
        res.status(201).send(winnerDetails)
      })
      .catch((e) => {
        res.send(e)
      })
  })

  app.put('/api/winners', function (req, res) {
    serviceWinners.calculateDailyWinners(req, res)
  })

  app.get('/api/ordersbycustomer/:userId', ordersController.listByCustomer)

  // production api paths
  app.post('/api/orderemail', function (req, res) {
    console.log('received Email')

    emailHelpers.parseEmail(req, res).then((emailFields) => {
      availablEmailFields = emailFields

      const getCompanyPromise = emailHelpers.findCompanyByEmail(emailFields)

      const companyObjectPromise = getCompanyPromise.then((returnedCompany) => {
        companyObject = returnedCompany
      })

      const orderPromise = getCompanyPromise.then((companyObject) =>
        emailHelpers
          .returnOrderNumberV2(
            emailFields['headers[subject]'],
            companyObject,
            emailFields['plain']
          )
          .then((returnedOrderNumber) => {
            orderNumber = returnedOrderNumber || 1
          })
      )

      const customerPromise = emailHelpers
        .findCustomerByEmail(
          emailFields['envelope[from]'],
          emailFields['envelope[to]']
        )
        .then((returnedCustomer) => {
          customer = returnedCustomer
        })

      const emailSenderPromise = emailHelpers
        .getField(emailFields, 'envelope[from]')
        .then((returnedCustomer) => {
          senderEmail = returnedCustomer
        })

      const emailDatePromise = emailHelpers
        .returnOrderDate(emailFields['html'])
        .then((returnedDate) => {
          console.log('order date will be entered as', returnedDate)
          orderDate = returnedDate
        })

      const emailPlainContentPromise = emailHelpers
        .getField(emailFields, 'plain')
        .then((returnedContent) => {
          plainContent = returnedContent
        })

      Promise.all([
        orderPromise,
        companyObjectPromise,
        customerPromise,
        emailSenderPromise,
        emailDatePromise,
        emailPlainContentPromise,
      ]).then((values) => {
        console.log(
          'woohoo! finito',
          orderNumber,
          companyObject.nameIdentifier,
          customer.id
        )
        ordersController.internalCreate(
          req,
          orderNumber,
          companyObject.emailIdentifier,
          companyObject.id,
          senderEmail,
          customer.id,
          emailFields['headers[subject]'],
          plainContent
        )
      })
    })

    // .then((company) => ordersController.internalCreate(req, orderNumber, company.emailIdentifier, company.id));
  })

  // Register a new user
  app.post('/api/users', usersController.create)
  app.post('/api/login', usersController.checkUser)

  // lookup userCompanies
  // get company IDs
  // look up Companies with those Ids

  // const userCompanies = require('../../vue-app/ellen-b2b/db/events.json')

  // New routes for Vue auth
  app.post('/api/dashboard', auth.getToken, companiesController.listByUser)

  app.put('/api/users/update/username/:id', usersController.update)
  app.get('/api/users', auth.getToken, usersController.list)
  app.post('/api/users/subscribe', serviceKlaviyo.addSubscribersToList)
  app.post(
    '/api/users/update/companies',
    auth.getToken,
    usersController.updateUserCompanies
  )

  app.put(
    '/api/users/update/companies',
    auth.getToken,
    usersController.removeUserCompanies
  )

  app.get(
    '/api/user/credit-balance',
    auth.getToken,
    creditTransactionController.getTotal
  )

  app.post('/api/companies/update/:id', companiesController.update)

  app.post(
    '/api/companies/setcategory',
    auth.getToken,
    companiesController.setCategory
  )

  app.post('/api/orders/update/:id', ordersController.update)

  // this is for the webhook, not the earnings button
  const eventEmitter = require('../services/eventBus').eventEmitter
  app.post('/api/earnings/receive', function (req, res) {
    console.log(req.body.body.data) // coming from FinnHub via parse at pipedream.com
    eventEmitter.emit('somedata', req.body.body.data)
    res.sendStatus(200)
  })

  // no params
  app.get(
    '/api/earnings/yesterday',
    auth.getToken,
    earningsController.getRecentEarnings
  )

  app.get(
    '/api/awaitedearningscalendar',
    auth.getToken,
    earningCalendarController.getUpcomingEarnings
  )
  // accepts req.body with all params for adding to DB
  app.post(
    '/api/earnings/quarterly/new',
    auth.getToken,
    earningsController.addQuarterlyEarning
  )

  // accepts req.body.ticker param
  app.put(
    '/api/earnings/quarterly',
    // auth.getToken,
    earningsController.getQuarterlyEarnings
  )

  app.get(
    '/api/earnings/quarterly/company',
    // auth.getToken,
    earningsController.getQuarterlyEarnings
  )

  app.get(
    '/api/earnings/store',
    auth.getToken,
    earningsController.getAndStoreQuarterlyEarnings
  )

  // gets latest ticker entries from DB to email
  app.get(
    '/api/earningemail/send',
    auth.getToken,
    earningsController.sendEarningEmail
  )

  // post in an array of tickers to be emailed
  app.post(
    '/api/earningemail/send',
    auth.getToken,
    earningsController.sendEmailFromTickers
  )

  // For any other request method on companies, we're going to return "Method Not Allowed"
  app.all('/api/companies', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
    })
  )

  app.post(
    '/api/companycategory/create',
    auth.getToken,
    companyCategoryController.create
  )

  app.post(
    '/api/orders/dates-available',
    auth.getToken,
    edisonController.monthsAvailableByYear
  )

  app.post(
    '/api/dataset-access/purchase',
    auth.getToken,
    datasetAccessController.create
  )

  app.get(
    '/api/dataset-access/company-by-user',
    auth.getToken,
    datasetAccessController.getUserAccessListByCompany
  )

  app.post(
    '/api/dataset-access/charge',
    auth.getToken,
    datasetAccessController.datasetAccessCharge
  )

  app.get(
    '/api/get-company',
    auth.getToken,
    companiesController.getIndexedCompany
  )

  // app.get(
  //   '/api/dataset-year-company-v2',
  //   auth.getToken,
  //   edisonController.edisonOrdersByYear
  // )

  app.get(
    '/api/dataset-year-company-indexed',
    auth.getToken,
    indexedEdisonController.indexedEdisonOrdersByYear
  )

  app.get('/api/companycategory/list', companyCategoryController.list)

  // debug endpoint
  // app.get(
  //   '/api/edison-test',
  //   auth.getToken,
  //   edisonController.edisonOrdersByYear
  // )
}
