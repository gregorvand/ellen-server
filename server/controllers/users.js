const User = require('../models').User
const Order = require('../models').Order
const jwt = require('jsonwebtoken')
const userHelpers = require('../utils/getUserFromToken')
const { sendAnEmail } = require('../services/email/sendgrid')
const bcrypt = require('bcrypt')

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
            (company) => company.companyEmail
          )
          user.setIndexedCompanies(companiesToSet)
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
        console.error('error in user create', error)
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
            username: user.username,
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
      const selectedCompanyEmails = req.body.selectedCompanies.map(
        (company) => company.companyEmail
      )

      currentUser
        .addIndexedCompanies(selectedCompanyEmails) // get company Email identifiers from state
        .then((user) => res.status(200).send(user))
        .catch((error) => res.status(400).send(error))
    } catch (err) {
      res.status(401)
    }
  },

  async removeUserCompanies(req, res) {
    console.log(req)
    try {
      const currentUser = await userHelpers.currentUser(req.token)
      const selectedCompanyEmail = req.body.selectedCompany
      console.log(currentUser.id, selectedCompanyEmail)
      currentUser
        .removeIndexedCompany(selectedCompanyEmail)
        .then(() => res.sendStatus(201))
        .catch((error) => res.status(400).send(error))
    } catch (err) {
      res.status(401)
    }
  },

  async forgotPassword(req, res) {
    const { userEmail } = req.body
    const user = await User.findOne({
      where: {
        email: userEmail,
      },
    })

    // if (err) {
    //   return res.status(400).json({ error: err })
    // }

    if (user) {
      const { email, password } = user
      const token = jwt.sign({ password }, process.env.USER_AUTH_SECRET, {
        expiresIn: '10m',
      })

      const message = {
        from: 'gregor@ellen.me', // Use the email address or domain you verified above
        template_id: 'd-7ca3fbae49cf42d98ec58d8ab3ce1ca1',
        dynamic_template_data: {
          resetLink: `${process.env.FRONTEND_URL}/reset-password/${token}`,
        },
        personalizations: [
          {
            to: [
              {
                email: user.email,
              },
            ],
          },
        ],
      }
      sendAnEmail(req, res, message, false)
      User.update({ reset_token: token }, { where: { email: user.email } })
    }

    if (!user || user) {
      return res.status(200).json({
        message:
          'If a user with that email exists, you will receive an email with a link to reset your password shortly.',
      })
    }
  },

  async resetPassword(req, res) {
    const { resetLink, newPassword } = req.body
    if (resetLink) {
      jwt.verify(resetLink, process.env.PASS_RESET_SECRET, async (err) => {
        if (err) {
          return res.json({ message: 'token is incorrect or expired' })
        }

        let user = await User.findOne({ where: { reset_token: resetLink } })
        if (user) {
          const salt = await bcrypt.genSalt(10)
          encNewPassword = await bcrypt.hash(newPassword, salt)
          User.update(
            { password: encNewPassword, reset_token: null },
            { where: { reset_token: resetLink } }
          )

          user = null
          return res.status(201).json({
            message: 'Updated Password',
          })
        } else {
          return res.json({ message: 'token is incorrect or expired' })
        }
      })
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
