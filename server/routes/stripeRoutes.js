const chargeHelpers = require('../utils/calculateCredits')
const creditTransationController = require('../controllers/creditTransaction')

const stripe = require('stripe')(
  'sk_test_51JS9eTG3YpE4JrlJc6uQRxZLkXszTng6xf8F45KN2kqO3yZctOoOn2djQaT5mkZe7hmLmMNLWwLYunIZ7EVxSw5E00KbgNEgMZ'
)

module.exports = (app, express) => {
  const calculateOrderAmount = (chargeAmount) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return chargeHelpers.calculateChargeFromCredits(chargeAmount)
  }
  app.post('/create-payment-intent', express.json(), async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      // amount: calculateOrderAmount(req.body.chargeAmount),
      amount: calculateOrderAmount(req.body.chargeAmount),
      currency: 'usd',
    })
    res.send({
      clientSecret: paymentIntent.client_secret,
    })
  })

  const User = require('../models').User
  const endpointSecret = process.env.STRIPE_WEBHOOK_AUTH_SEC
  // Use body-parser to retrieve the raw body as a buffer
  app.post(
    '/stripe-webhook',
    require('body-parser').raw({ type: '*/*' }),
    async (request, response) => {
      const sig = request.headers['stripe-signature']
      console.log('sig', sig)

      let event
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          sig,
          endpointSecret
        )
        console.log('yerp', event)
      } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`)
      }

      const chargeObject = event.data.object
      console.log(chargeObject.billing_details)

      const user = await User.findOne({
        where: {
          email: chargeObject.billing_details.email,
        },
      })

      const userId = user.dataValues.id

      switch (event.type) {
        case 'charge.succeeded':
          const creditsToAdd = chargeHelpers.calculateCreditsFromCharge(
            chargeObject.amount_captured
          )
          console.log(
            `Charge was successful! from ${chargeObject.id}, ${chargeObject.billing_details.email}`
          )
          console.log('adding', creditsToAdd)
          creditTransationController.create({
            creditValue: creditsToAdd,
            activated: true,
            method: 'internal',
            customerId: userId,
          })
          break
        case 'payment_method.attached':
          const paymentMethod = event.data.object
          console.log('PaymentMethod was attached to a Customer!')
          break
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`)
      }

      // Handle the event

      // Return a response to acknowledge receipt of the event
      response.json({ received: true })
    }
  )
}
