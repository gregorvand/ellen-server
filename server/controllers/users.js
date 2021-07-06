const User = require('../models').User
const Order = require('../models').Order
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

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

    // do checks and then execute below if they all
    let errorsToSend = []

    User.create({
      firstName: req?.body?.firstName || '',
      lastName: req?.body?.lastName || '',
      email: req.body.email || user.email,
      password: req.body.password || user.password,
      identifier: req.body.identifier || 'undefined',
    })
      .then((user) => {
        console.log(user)
        if (req.body?.userCompanies) {
          const companiesToSet = req.body.userCompanies.map(
            (company) => company.id
          )
          user.setCompanies(companiesToSet)
        } else {
          console.log('user did not have any associated companies on register')
        }

        const token = jwt.sign({ user }, process.env.USER_AUTH_SECRET)
        // In a production app, you'll want the secret key to be an environment variable
        res.json({
          token,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        })
      })
      .catch((error) => {
        let errorMessage = error
        // this.errors = error.response.errors
        errorsToSend.push(errorMessage)
        // res.status(400).send(error)
        res.status(400).send({
          message: error,
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
        [Op.and]: [{ email: req.body.email }, { password: req.body.password }],
      },
    })
      .then((user) => {
        const token = jwt.sign({ user }, process.env.USER_AUTH_SECRET)
        // In a production app, you'll want the secret key to be an environment variable
        res.json({
          token,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        })
        res.send(200)
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
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          })
        }
        return user
          .update({
            username: req.body.username,
          })
          .then(() => res.status(200).send(company)) // Send back the updated todo.
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  updateByEmail(req, res) {
    jwt.verify(req.token, process.env.USER_AUTH_SECRET, (err) => {
      if (err) {
        res.sendStatus(401)
      } else {
        return User.findOne({
          where: {
            email: req.headers.user,
          },
        })
          .then((user) => {
            if (!user) {
              return res.status(404).send({
                message: 'User Not Found',
              })
            }
            console.log('req was', req.body.selectedCompanies)

            const selectedCompanyIds = req.body.selectedCompanies.map(
              (company) => company.id
            )
            user
              .addCompanies(selectedCompanyIds) // get company IDs from state
              .then((user) => res.status(200).send(user))
              .catch((error) => res.status(400).send(error))
          })
          .catch((error) => res.status(400).send(error))
      }
    })
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
