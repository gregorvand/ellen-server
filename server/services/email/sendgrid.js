const sgMail = require('@sendgrid/mail')
const { response } = require('express')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

//ES6
module.exports = {
  sendAnEmail(req, res, message, response = true) {
    sgMail.send(message).then(
      () => {},
      (error) => {
        console.error(error)

        if (error.response) {
          console.error(error.response.body)
        }
      },
      function () {
        if (response) {
          res.sendStatus(200)
        }
      }
    )
  },
}
