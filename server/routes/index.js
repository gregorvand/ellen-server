// const todosController = require('../controllers/todos');
// const todoItemsController = require('../controllers/todoitems');
const companiesController = require('../controllers/companies');
const ordersController = require('../controllers/orders');

const emailHelpers = require('../modules/emailHelpers');

const formidable = require('formidable');

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

  app.post('/api/companies', companiesController.create);
  app.get('/api/companies', companiesController.list);

  app.post('/api/orders', ordersController.create);
  app.get('/api/orders', ordersController.list);

  app.post('/api/orderemail', function(req, res) {
    console.log('received @ emailR', Date.now());

    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      emailHelpers.returnOrderNumber(fields['headers[subject]']);
      
      res.writeHead(200, {'content-type': 'text/plain'})
      res.end('Message Received. Thanks!\r\n')
    })
  });

  app.post('/email', function(req, res) {
    console.log('receieved @ email');

    let form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      // console.log(fields)
      // console.log('sender?', fields['sender'])
      console.log('all fields', fields['plain']);
      res.writeHead(200, {'content-type': 'text/plain'})
      res.end('Message Received. Thanks!\r\n')
    })
  });

  // For any other request method on companies, we're going to return "Method Not Allowed"
  app.all('/api/companies', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
  }));
};  