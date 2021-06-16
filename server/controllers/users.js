const User = require('../models').User
const Order = require('../models').Order
const jwt = require('jsonwebtoken')

module.exports = {
  create(req, res) {
    // console.log('what is the req', req)

    if (req.data) {
      const user = {
        // name: req.body.name,
        email: req.data.credentials.email,
        password: req.data.credentials.password,
        // In a production app, you'll want to encrypt the password
      }
    }

    // Generate token
    const data = JSON.stringify(req?.data?.credentials, null, 2)
    const token = jwt.sign({ data }, process.env.USER_AUTH_SECRET)

    // do checks and then execute below if they all
    let errorsToSend = []

    return User.create({
      firstName: req?.body?.firstName || req?.data?.credentials.firstName || '',
      lastName: req?.body?.lastName || req?.data?.credentials.lastName || '',
      email: req.body.email || user.email,
      password: req.body.password || user.password,
      identifier: req.body.identifier || 'undefined',
    })
      .then((user) => res.status(201).send({ user, token }))
      .catch((error) => {
        let errorMessage = error.errors[0].message
        // this.errors = error.response.errors
        errorsToSend.push(errorMessage)
        // res.status(400).send(error)
        res.status(400).send({
          message: error.errors[0].message,
        })
      })
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

  checkUser(req, res) {
    return User.findOne({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
    })
      .then((user) => {
        if (user.email) {
          const token = jwt.sign({ user }, process.env.USER_AUTH_SECRET)
          // In a production app, you'll want the secret key to be an environment variable
          res.json({
            token,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          })
        } else {
          res.status(400)
        }
      })
      .catch((error) => {
        console.log(error)
        res
          .status(400)
          .send(
            'Sorry we could not locate an account with that email or password'
          )
      })
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
