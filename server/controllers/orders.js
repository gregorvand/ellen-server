const Order = require('../models').Order;
const Company = require('../models').Company;
// const TodoItem = require('../models').TodoItem;

module.exports = {
  create(req, res, orderNumber) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    return Order
      .create({
        orderNumber: orderNumber || req.body.number || 1,
        orderDate: req.body.date || Date.now(),
        fromEmail: req.body.fromEmail || 'shop@sendertest.com',
        customerEmail: req.body.customerEmail || 'gregor@vand.hk',
        plainContent: req.body.content || 'Hello this is the email stuff!',
        companyId: req.body.companyId || 1
      })
      .then(company => res.status(201).send(company))
      .catch(error => res.status(400).send(error));
  },

  internalCreate(req = false, orderNumber, fromEmail, companyId, customerEmail, customerId, subject) {
    // emailHelpers.returnOrderNumber(req);
    // emailHelpers.parseSubjectForOrder(req);
    return Order
      .create({
        orderNumber: orderNumber || req.body.number,
        orderDate: orderDate || null,
        fromEmail: fromEmail || 'shop@sendertest.com',
        customerEmail: req.body.customerEmail || customerEmail,
        plainContent: req.body.content || subject,
        companyId: companyId || 1,
        customerId: customerId || 1
      })
  },

  list(req, res) {
    if(req.body.email) {
      return Order.findAll({
        where: {
          customerEmail: req.body.email
        }
      })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
    } else {
      return Order
      .findAll()
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error));
    }
  },

  listByCustomer(req, res) {
    return Order
    .findAll({
      where: {
        customerId: req.params.userId
      },
      include: [{
        model: Company,
        attributes: ['nameIdentifier'],
      }],
      order: [ [ Company, 'nameIdentifier', 'ASC' ] ],
      raw: true
    })
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
