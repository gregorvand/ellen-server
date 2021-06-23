const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(sgMail.setApiKey(process.env.SENDGRID_API_KEY))
const msg = {
  to: 'gregor@vand.hk',
  from: 'gregor@ellen.me', // Use the email address or domain you verified above
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
//ES6

function sendEmail() {
  sgMail.send(msg).then(
    () => {},
    (error) => {
      console.error(error)

      if (error.response) {
        console.error(error.response.body)
      }
    }
  )
}

module.exports.sendEmail = sendEmail
