const todosController = require('../controllers/todos');
const todoItemsController = require('../controllers/todoitems');
const formidable = require('formidable');

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));

  app.post('/api/todos', todosController.create);
  app.get('/api/todos', todosController.list);
  app.get('/api/todos/:todoId', todosController.retrieve);
  app.put('/api/todos/:todoId', todosController.update);
  app.delete('/api/todos/:todoId', todosController.destroy);

  app.post('/api/todos/:todoId/items', todoItemsController.create);
  app.put('/api/todos/:todoId/items/:todoItemId', todoItemsController.update);
  app.delete('/api/todos/:todoId/items/:todoItemId', todoItemsController.destroy);

  app.post('/email', function(req, res) {
    console.log('receieved @ email');
    let form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
      // console.log(fields)
      console.log('sender?', fields['sender'])
      console.log('all fields', fields['plain'])
      console.log('all fields', fields['html'])
      res.writeHead(200, {'content-type': 'text/plain'})
      res.end('Message Received. Thanks!\r\n')
    })
  });

  // For any other request method on todo items, we're going to return "Method Not Allowed"
  app.all('/api/todos/:todoId/items', (req, res) =>
    res.status(405).send({
      message: 'Method Not Allowed',
  }));
};  