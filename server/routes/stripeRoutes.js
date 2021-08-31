const stripe = require('stripe')(
  'sk_test_51JS9eTG3YpE4JrlJc6uQRxZLkXszTng6xf8F45KN2kqO3yZctOoOn2djQaT5mkZe7hmLmMNLWwLYunIZ7EVxSw5E00KbgNEgMZ'
)

module.exports = (app, express) => {
  const calculateOrderAmount = (chargeAmount) => {
    console.log(chargeAmount)
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return chargeAmount * 1
  }
  app.post('/create-payment-intent', express.json(), async (req, res) => {
    // const { chargeAmount } =
    // console.log('yew', req)
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

  const endpointSecret = process.env.STRIPE_WEBHOOK_AUTH_SEC
  // Use body-parser to retrieve the raw body as a buffer
  app.post(
    '/stripe-webhook',
    require('body-parser').raw({ type: '*/*' }),
    (request, response) => {
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

      switch (event.type) {
        case 'charge.succeeded':
          const chargeObject = event.data.object
          console.log(
            `Charge was successful! from ${chargeObject.id}, ${chargeObject.billing_details.email}`
          )
          // TODO: INSERT CHARGE RECORD (NEED MODEL) AND UPDATE POINTS ACCORDINGLY
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
