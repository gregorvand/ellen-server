const Order = require('../models').Order;
const emailHelpers = require('../modules/emailHelpers');
// const TodoItem = require('../models').TodoItem;

module.exports = {
  create(req, res, orderNumber) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    return Order
      .create({
        orderNumber: orderNumber || req.body.number,
        orderDate: req.body.date || Date.now(),
        fromEmail: req.body.fromEmail || 'shop@sendertest.com',
        customerEmail: req.body.customerEmail || 'customer@receivertest.com',
        plainContent: req.body.content || 'Hello this is the email stuff!',
        companyId: req.body.companyId || 1
      })
      .then(company => res.status(201).send(company))
      .catch(error => res.status(400).send(error));
  },

  internalCreate(req, orderNumber, fromEmail, companyId) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    return Order
      .create({
        orderNumber: orderNumber || req.body.number,
        orderDate: req.body.date || Date.now(),
        fromEmail: fromEmail || 'shop@sendertest.com',
        customerEmail: req.body.customerEmail || 'customer@receivertest.com',
        plainContent: req.body.content || 'Hello this is the email stuff!',
        companyId: companyId || 1
      })
  },

  list(req, res) {
    return Order
      // .findAll({
      //   include: [{
      //     model: TodoItem,
      //     as: 'todoItems',
      //   }],
      // })
      .findAll()
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
  },

  // retrieve(req, res) {
  //     return Todo
  //       .findByPk(req.params.todoId, {
  //         include: [{
  //           model: TodoItem,
  //           as: 'todoItems',
  //         }],
  //       })
  //       .then((todo) => {
  //         if (!todo) {
  //           return res.status(404).send({
  //             message: 'Todo Not Found',
  //           });
  //         }
  //         return res.status(200).send(todo);
  //       })
  //       .catch((error) => res.status(400).send(error));
  //   },

  //   update(req, res) {
  //     return Todo
  //       .findByPk(req.params.todoId, {
  //         include: [{
  //           model: TodoItem,
  //           as: 'todoItems',
  //         }],
  //       })
  //       .then(todo => {
  //         if (!todo) {
  //           return res.status(404).send({
  //             message: 'Todo Not Found',
  //           });
  //         }
  //         return todo
  //           .update({
  //             title: req.body.title || todo.title,
  //           })
  //           .then(() => res.status(200).send(todo))  // Send back the updated todo.
  //           .catch((error) => res.status(400).send(error));
  //       })
  //       .catch((error) => res.status(400).send(error));
  //   },

  //   destroy(req, res) {
  //     return Todo
  //       .findByPk(req.params.todoId)
  //       .then(todo => {
  //         if (!todo) {
  //           return res.status(400).send({
  //             message: 'Todo Not Found',
  //           });
  //         }
  //         return todo
  //           .destroy()
  //           .then(() => res.status(200).send({ message: 'Todo deleted successfully.' }))
  //           .catch(error => res.status(400).send(error));
  //       })
  //       .catch(error => res.status(400).send(error));
  //   },
};
