// const todosController = require('../controllers/todos');
// const todoItemsController = require('../controllers/todoitems');
const companiesController = require('../controllers/companies');
const ordersController = require('../controllers/orders');
const usersController = require('../controllers/users');

const emailHelpers = require('../modules/emailHelpers');

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));

  // app.get('/api/todos/:todoId', todosController.retrieve);
  // app.put('/api/todos/:todoId', todosController.update);
  // app.delete('/api/todos/:todoId', todosController.destroy);

  // app.post('/api/todos/:todoId/items', todoItemsController.create);
  // app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.update);
  // app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.destroy);

  // direct/testing api paths
  app.post('/api/companies', companiesController.create);
  app.get('/api/companies', companiesController.list);

  app.post('/api/orders', ordersController.create);
  app.get('/api/orders', ordersController.list);

  // production api paths
  app.post('/api/orderemail', function(req, res) {
    console.log('received Email');

    emailHelpers.parseEmail(req, res)
      .then((emailFields) => {
        availablEmailFields = emailFields;
        console.log('at least subject was', emailFields['headers[subject]']);
        const orderPromise = emailHelpers.returnOrderNumber(emailFields['headers[subject]']).then((returnedOrderNumber) => {
          orderNumber = returnedOrderNumber;
        });

        const companyPromise = emailHelpers.findCompanyByEmail(emailFields['html']).then(returnedCompany => {
          companyObject = returnedCompany;
        });

        const customerPromise = emailHelpers.findCustomerByEmail(emailFields['envelope[from]']).then(returnedCustomer => {
          customer = returnedCustomer;
        });

        const emailSenderPromise = emailHelpers.getField(emailFields, 'envelope[from]').then(returnedCustomer => {
          senderEmail = returnedCustomer;
        });

        Promise.all([
          orderPromise,
          companyPromise,
          customerPromise,
          emailSenderPromise
        ]).then(() => {
          console.log('woohoo! finito', orderNumber, companyObject.nameIdentifier, customer.id);
          ordersController.internalCreate(req, orderNumber, companyObject.emailIdentifier, companyObject.id, senderEmail, customer.id);
        });
       })
       
      // .then((company) => ordersController.internalCreate(req, orderNumber, company.emailIdentifier, company.id));
  });

  app.post('/api/users', usersController.create);
  app.get('/api/users', usersController.list);

  // For any other request method on companies, we're going to return "Method Not Allowed"
  app.all('/api/companies', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
  }));
};