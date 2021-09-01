const User = require('../models').User
const Order = require('../models').Order
const jwt = require('jsonwebtoken')
const userHelpers = require('../utils/getUserFromToken')
// const bcrypt = require('bcrypt')

module.exports = {
  async create(req, res) {
    // console.log('what is the req', req)

    const password = req.body?.password || user.password
    // let hashedPassword = await bcrypt.hash(password, 15)
    // console.log('hashed happened..', hashedPassword)

    // do checks and then execute below if they all
    let errorsToSend = []

    User.create({
      firstName: req?.body?.firstName || '',
      lastName: req?.body?.lastName || '',
      email: req.body.email || user.email,
      password: password,
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
    console.log(req.body.email)

    // for sec do not expose to user which bit was incorrect
    const genericMessage =
      'Sorry we could not locate an account with that email or password'
    return User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then(async (user) => {
        if (!user) {
          res.status(400).send(genericMessage)
        } else if (!(await user.validPassword(req.body.password))) {
          res.status(400)
          res.send(genericMessage)
        } else {
          const token = jwt.sign({ user }, process.env.USER_AUTH_SECRET)
          res.json({
            token,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          })
        }
      })
      .catch((error) => {
        console.log(error)
        res.status(400).send(genericMessage)
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

  async updateUserCompanies(req, res) {
    try {
      const currentUser = await userHelpers.currentUser(req.token)
      const selectedCompanyIds = req.body.selectedCompanies.map(
        (company) => company.id
      )
      currentUser
        .addCompanies(selectedCompanyIds) // get company IDs from state
        .then((user) => res.status(200).send(user))
        .catch((error) => res.status(400).send(error))
    } catch (err) {
      res.status(401)
    }
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
