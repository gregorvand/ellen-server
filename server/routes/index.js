// const todosController = require('../controllers/todos');
// const todoItemsController = require('../controllers/todoitems');
const companiesController = require('../controllers/companies');
const ordersController = require('../controllers/orders');
const usersController = require('../controllers/users');

const emailHelpers = require('../modules/emailHelpers');

module.exports = (app) => {
  // app.get('/api/todos/:todoId', todosController.retrieve);
  // app.put('/api/todos/:todoId', todosController.update);
  // app.delete('/api/todos/:todoId', todosController.destroy);

  // app.post('/api/todos/:todoId/items', todoItemsController.create);
  // app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.update);
  // app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.destroy);

  // direct/testing api paths
  app.post('/api/companies', companiesController.create);
  app.get('/api/companies', companiesController.list);
  app.get('/api/companies/:companyId', companiesController.listByCompany);

  app.post('/api/orders', ordersController.create);
  app.get('/api/orders', ordersController.list);

  app.get('/api/ordersbycustomer/:userId', ordersController.listByCustomer);


  // production api paths
  app.post('/api/orderemail', function(req, res) {
    console.log('received Email');

    emailHelpers.parseEmail(req, res)
      .then((emailFields) => {
        availablEmailFields = emailFields;

        const getCompanyPromise = emailHelpers.findCompanyByEmail(emailFields);

        const companyObjectPromise = getCompanyPromise.then(returnedCompany => {
          companyObject = returnedCompany;
        })

        const orderPromise = getCompanyPromise.then((companyObject) => emailHelpers.returnOrderNumberV2(emailFields['headers[subject]'], companyObject, emailFields['plain']).then((returnedOrderNumber) => {
          orderNumber = returnedOrderNumber || 1;
        }));

        const customerPromise = emailHelpers.findCustomerByEmail(emailFields['envelope[from]'], emailFields['envelope[to]']).then(returnedCustomer => {
          customer = returnedCustomer;
        });

        const emailSenderPromise = emailHelpers.getField(emailFields, 'envelope[from]').then(returnedCustomer => {
          senderEmail = returnedCustomer;
        });

        const emailDatePromise = emailHelpers.returnOrderDate(emailFields['html']).then(returnedDate => {
          console.log('order date will be entered as', returnedDate);
          orderDate = returnedDate;
        });

        const emailPlainContentPromise = emailHelpers.getField(emailFields, 'plain').then(returnedContent => {
          plainContent = returnedContent;
        });

        Promise.all([
          orderPromise,
          companyObjectPromise,
          customerPromise,
          emailSenderPromise,
          emailDatePromise,
          emailPlainContentPromise
        ]).then((values) => {
          console.log('woohoo! finito', orderNumber, companyObject.nameIdentifier, customer.id);
          ordersController.internalCreate(req, orderNumber, companyObject.emailIdentifier, companyObject.id, senderEmail, customer.id, emailFields['headers[subject]'], plainContent);
        });
       })
       
      // .then((company) => ordersController.internalCreate(req, orderNumber, company.emailIdentifier, company.id));
  });

  app.post('/api/users', usersController.create);
  app.get('/api/users', usersController.list);

  app.post('/api/companies/update/:id', companiesController.update);
  app.post('/api/orders/update/:id', ordersController.update);

  // For any other request method on companies, we're going to return "Method Not Allowed"
  app.all('/api/companies', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
  }));
};