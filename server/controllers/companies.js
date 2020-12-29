const Company = require('../models').Company;
const Order = require('../models').Order;

module.exports = {
  create(req, res) {
    return Company
      .create({
        nameIdentifier: req.body.name,
        emailIdentifier: req.body.email,
        orderPrefix: req.body.prefix || '#',
        orderSuffix: req.body.suffix || '',
      })
      .then(company => res.status(201).send(company))
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return Company
      .findAll({
        include: [{
          model: Order,
          as: 'orders'
        }],
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