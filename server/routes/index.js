// const todosController = require('../controllers/todos');
// const todoItemsController = require('../controllers/todoitems');
const companiesController = require('../controllers/companies')
const ordersController = require('../controllers/orders')
const usersController = require('../controllers/users')
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
  app.get('/api/companies', companiesController.list)
  app.get('/api/companies/:companyId', companiesController.listByCompany)

  app.post('/api/orders', ordersController.create)
  app.get('/api/orders', ordersController.list)

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
  app.get('/api/dashboard', auth.getToken, companiesController.listByUser)

  app.put('/api/users/update/username/:id', usersController.update)
  app.get('/api/users', usersController.list)
  app.post('/api/users/subscribe', serviceKlaviyo.addSubscribersToList)
  app.post(
    '/api/users/update/companies',
    auth.getToken,
    usersController.updateByEmail
  )

  app.post('/api/companies/update/:id', companiesController.update)
  app.post('/api/orders/update/:id', ordersController.update)

  // For any other request method on companies, we're going to return "Method Not Allowed"
  app.all('/api/companies', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
    })
  )
}
