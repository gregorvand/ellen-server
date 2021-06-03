const User = require('../models').User
const Order = require('../models').Order

module.exports = {
  create(req, res) {
    // console.log('what is the req', req)
    return User.create({
      firstName: req.body.firstName || req.data.credentials.firstName,
      lastName: req.body.lastName || req.data.credentials.lastName,
      email: req.body.email || req.data.credentials.email,
      password: req.body.password || req.data.credentials.password,
      identifier: req.body.identifier | 'undefined',
    })
      .then((user) => res.status(201).send(user))
      .catch((error) => res.status(400).send(error))
  },

  list(req, res) {
    return User.findAll({
      include: [
        {
          model: Order,
          as: 'orders',
        },
      ],
    })
      .then((companies) => res.status(200).send(companies))
      .catch((error) => res.status(400).send(error))
  },

  update(req, res) {
    return User.findByPk(req.params.id)
      .then((company) => {
        if (!company) {
          return res.status(404).send({
            message: 'User Not Found',
          })
        }
        return company
          .update({
            username: req.body.username,
          })
          .then(() => res.status(200).send(company)) // Send back the updated todo.
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  // takes an object from function calling it, e.g:
  // {'email': email}
  // where the first is a string to match DB column name, second is the object to compare
}

async function checkDbForUser(lookup) {
  return User.findOne({
    where: [lookup],
  })
    .then((foundUser) => foundUser)
    .catch((error) => console.error(error))
}

module.exports.checkDbForUser = checkDbForUser
