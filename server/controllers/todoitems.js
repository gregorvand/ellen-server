const TodoItem = require('../models').TodoItem;

module.exports = {
  create(req, res) {
    return TodoItem
      .create({
        content: req.body.content,
        todoId: req.params.todoId,
      })
      .then(todoItem => res.status(201).send(todoItem))
      .catch(error => res.status(400).send(error));
  },

  update(req, res) {
  return TodoItem
    .findOne({
        where: {
          id: req.params.todoItemId,
          todoId: req.params.todoId,
        },
      })
    .then(todoItem => {
      if (!todoItem) {
        return res.status(404).send({
          message: 'TodoItem Not Found',
        });
      }

      return todoItem
        // the commented out is a more manual version of the actual function below
        // .update({
        //   content: req.body.content || todoItem.content,
        //   complete: req.body.complete || todoItem.complete,
        // })
        // see https://sequelize.org/master/manual/model-instances.html for Object keys approach
        .update(req.body, { fields: Object.keys(req.body) })
        .then(updatedTodoItem => res.status(200).send(updatedTodoItem))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
},

destroy(req, res) {
  return TodoItem
    .findOne({
        where: {
          id: req.params.todoItemId,
          todoId: req.params.todoId,
        },
      })
    .then(todoItem => {
      if (!todoItem) {
        return res.status(404).send({
          message: 'TodoItem Not Found',
        });
      }

      return todoItem
        .destroy()
        .then(() => res.status(200).send({ message: 'Todo Item deleted successfully.' }))
        .catch(error => res.status(400).send(error));
    })
    .catch(error => res.status(400).send(error));
},
};